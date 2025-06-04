import Project from './Project';
import Todo from './Todo';
import Storage from './Storage';
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns';

export default class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentView = 'today'; // Default view
        this.itemToDelete = null; // Track item to delete
        this.setupUI();
        this.setupEventListeners();
        this.loadProjects();
        
        // Set initial view to today
        this.changeView('today');
    }

    setupUI() {
        this.projectsList = document.getElementById('projects-list');
        this.projectTemplate = document.getElementById('project-item-template');
        this.addProjectBtn = document.getElementById('add-project-btn');
        this.projectDialog = document.getElementById('add-project-dialog');
        this.projectForm = document.getElementById('add-project-form');
        this.closeDialogBtn = document.getElementById('close-project-modal');
        this.cancelBtn = document.getElementById('cancel-project');
        this.todosContainer = document.getElementById('todos-container');
        
        // View buttons
        this.todayBtn = document.getElementById('today-btn');
        this.thisWeekBtn = document.getElementById('this-week-btn');
        this.thisMonthBtn = document.getElementById('this-month-btn');

        // Add todo details dialog elements
        this.todoDetailsDialog = document.getElementById('view-todo-dialog');
        this.closeTodoDetailsBtn = document.getElementById('close-todo-details');
        this.closeDetailsBtn = document.getElementById('close-details');

        // Delete confirmation dialog elements
        this.deleteDialog = document.getElementById('delete-confirm-dialog');
        this.closeDeleteBtn = document.getElementById('close-delete-modal');
        this.cancelDeleteBtn = document.getElementById('cancel-delete');
        this.confirmDeleteBtn = document.getElementById('confirm-delete');

        // Add Todo Dialog elements
        this.todoDialog = document.getElementById('add-todo-dialog');
        this.todoForm = document.getElementById('add-todo-form');
        this.closeTodoBtn = document.getElementById('close-todo-modal');
        this.cancelTodoBtn = document.getElementById('cancel-todo');
        this.addTodoBtn = document.getElementById('add-todo-btn');
        this.todoProjectSelect = document.getElementById('todo-project');
    }

    setupEventListeners() {
        // Project Dialog Events
        this.addProjectBtn.addEventListener('click', () => this.projectDialog.showModal());
        this.closeDialogBtn.addEventListener('click', () => this.projectDialog.close());
        this.cancelBtn.addEventListener('click', () => this.projectDialog.close());

        // Project Form Submission
        this.projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('project-title');
            const title = titleInput.value.trim();
            
            if (title) {
                this.createProject(title);
                titleInput.value = '';
                this.projectDialog.close();
            }
        });

        // Project List Click Events
        this.projectsList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.project-delete-btn');
            const projectItem = e.target.closest('.project-item');

            if (deleteBtn && projectItem) {
                e.stopPropagation();
                this.deleteProject(projectItem.dataset.projectId);
            } else if (projectItem) {
                this.currentView = 'project';
                this.selectProject(projectItem.dataset.projectId);
            }
        });

        // Todo Events
        document.addEventListener('todo:created', (e) => {
            const todoData = e.detail;
            this.addTodoToProject(todoData);
        });

        // View Filters
        this.todayBtn.addEventListener('click', () => this.changeView('today'));
        this.thisWeekBtn.addEventListener('click', () => this.changeView('week'));
        this.thisMonthBtn.addEventListener('click', () => this.changeView('month'));

        // Todo Details Dialog Events
        this.closeTodoDetailsBtn.addEventListener('click', () => this.todoDetailsDialog.close());
        this.closeDetailsBtn.addEventListener('click', () => this.todoDetailsDialog.close());

        // Delete Dialog Events
        this.closeDeleteBtn.addEventListener('click', () => this.deleteDialog.close());
        this.cancelDeleteBtn.addEventListener('click', () => this.deleteDialog.close());
        this.confirmDeleteBtn.addEventListener('click', () => {
            if (this.itemToDelete) {
                if (this.itemToDelete.type === 'project') {
                    this.confirmDeleteProject(this.itemToDelete.id);
                } else if (this.itemToDelete.type === 'todo') {
                    this.confirmDeleteTodo(this.itemToDelete.id);
                }
                this.deleteDialog.close();
            }
        });

        // Add Todo Dialog Events
        this.addTodoBtn.addEventListener('click', () => {
            this.updateTodoProjectSelect();
            this.todoDialog.showModal();
        });
        
        this.closeTodoBtn.addEventListener('click', () => this.todoDialog.close());
        this.cancelTodoBtn.addEventListener('click', () => this.todoDialog.close());

        // Todo Form Submission
        this.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.todoForm);
            
            const todoData = {
                id: 'todo-' + Date.now(),
                title: formData.get('title'),
                description: formData.get('description'),
                projectId: formData.get('project'),
                priority: formData.get('priority'),
                dueDate: formData.get('due-date')
            };

            this.addTodoToProject(todoData);
            this.todoForm.reset();
            this.todoDialog.close();
        });
    }

    loadProjects() {
        const savedProjects = Storage.getProjects();
        this.projects = savedProjects.map(data => {
            const project = new Project(data.id, data.title);
            data.todos.forEach(todoData => {
                const todo = new Todo(
                    todoData.id,
                    todoData.title,
                    todoData.description,
                    todoData.projectId,
                    todoData.priority,
                    todoData.dueDate
                );
                todo.completed = todoData.completed;
                todo.createdAt = new Date(todoData.createdAt);
                project.addTodo(todo);
            });
            return project;
        });
        this.renderProjects();
        
        // Select first project if exists
        if (this.projects.length > 0) {
            this.selectProject(this.projects[0].id);
        }
    }

    saveProjects() {
        Storage.saveProjects(this.projects.map(project => project.toJSON()));
    }

    createProject(title) {
        const project = new Project('project-' + Date.now(), title);
        this.projects.push(project);
        this.renderProjects();
        this.saveProjects();
        this.selectProject(project.id);
    }

    deleteProject(projectId) {
        this.itemToDelete = { type: 'project', id: projectId };
        this.deleteDialog.showModal();
    }

    confirmDeleteProject(projectId) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.projects.splice(index, 1);
            this.renderProjects();
            this.saveProjects();

            // Select another project if available
            if (this.projects.length > 0) {
                this.selectProject(this.projects[0].id);
            } else {
                this.todosContainer.innerHTML = '<div class="empty-state">Create a project to get started</div>';
            }
        }
    }

    selectProject(projectId) {
        // Update UI
        const projectItems = this.projectsList.querySelectorAll('.project-item');
        projectItems.forEach(item => {
            item.classList.toggle('active', item.dataset.projectId === projectId);
        });

        // Remove active state from view buttons
        [this.todayBtn, this.thisWeekBtn, this.thisMonthBtn].forEach(btn => {
            btn.classList.remove('active');
        });

        // Update title and render todos
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('current-view-title').textContent = project.title;
            this.renderTodos(project.id);
        }
    }

    renderProjects() {
        // Clear existing projects except template
        const template = this.projectTemplate;
        this.projectsList.innerHTML = '';
        this.projectsList.appendChild(template);

        // Render each project
        this.projects.forEach(project => {
            const projectElement = this.projectTemplate.content.cloneNode(true);
            const projectItem = projectElement.querySelector('.project-item');
            
            projectItem.dataset.projectId = project.id;
            projectItem.querySelector('.project-title').textContent = project.title;

            this.projectsList.appendChild(projectItem);
        });
    }

    updateTodoProjectSelect() {
        // Clear existing options except the default one
        while (this.todoProjectSelect.options.length > 1) {
            this.todoProjectSelect.remove(1);
        }

        // Add project options
        this.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            this.todoProjectSelect.appendChild(option);
        });

        // If we have projects, enable the select and select the first project
        if (this.projects.length > 0) {
            this.todoProjectSelect.disabled = false;
            this.todoProjectSelect.value = this.projects[0].id;
        } else {
            this.todoProjectSelect.disabled = true;
        }
    }

    addTodoToProject(todoData) {
        const project = this.projects.find(p => p.id === todoData.projectId);
        if (project) {
            const todo = new Todo(
                todoData.id,
                todoData.title,
                todoData.description,
                todoData.projectId,
                todoData.priority,
                todoData.dueDate
            );
            project.addTodo(todo);
            this.saveProjects();

            // Update the view based on current state
            if (this.currentView === 'project') {
                this.renderTodos(project.id);
            } else {
                this.renderFilteredTodos();
            }
        }
    }

    renderTodos(projectId) {
        if (projectId) {
            const project = this.projects.find(p => p.id === projectId);
            
            if (!project) {
                this.todosContainer.innerHTML = '<div class="empty-state">Select a project to see todos</div>';
                return;
            }

            const todos = project.getAllTodos();
            if (todos.length === 0) {
                this.todosContainer.innerHTML = '<div class="empty-state">No todos in this project yet</div>';
                return;
            }

            // Group todos by date
            const todosByDate = this.groupTodosByDate(todos);
            
            // Render todos
            this.todosContainer.innerHTML = '';
            Object.entries(todosByDate).forEach(([date, dateTodos]) => {
                const dateSection = document.createElement('div');
                dateSection.className = 'todos-date-section';
                
                const dateHeader = document.createElement('h2');
                dateHeader.className = 'date-header';
                dateHeader.textContent = date;
                dateSection.appendChild(dateHeader);

                dateTodos.forEach(todo => {
                    const todoElement = this.createTodoElement(todo);
                    dateSection.appendChild(todoElement);
                });

                this.todosContainer.appendChild(dateSection);
            });
        } else {
            // If no project is selected, show filtered view
            this.renderFilteredTodos();
        }
    }

    groupTodosByDate(todos) {
        const groups = {};
        todos.forEach(todo => {
            const date = new Date(todo.dueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(todo);
        });
        return groups;
    }

    createTodoElement(todo) {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item${todo.completed ? ' completed' : ''}`;
        todoItem.dataset.todoId = todo.id;

        todoItem.innerHTML = `
            <div class="todo-checkbox-wrapper">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            </div>
            <div class="todo-content">
                <div class="todo-main">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-description">${todo.description || ''}</div>
                </div>
                <div class="todo-details">
                    ${todo.projectTitle ? `<span class="todo-project">📁 ${todo.projectTitle}</span>` : ''}
                    <span class="todo-due-date">📅 Due: ${new Date(todo.dueDate).toLocaleDateString()}</span>
                    <span class="todo-priority priority-${todo.priority.toLowerCase()}">${todo.priority}</span>
                </div>
                <div class="todo-actions">
                    <button class="todo-action-btn view-btn" title="View Details">👁️</button>
                    <button class="todo-action-btn delete-btn" title="Delete Todo">×</button>
                </div>
            </div>
        `;

        // Add event listeners
        const checkbox = todoItem.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => this.toggleTodoComplete(todo.id));

        const deleteBtn = todoItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

        const viewBtn = todoItem.querySelector('.view-btn');
        viewBtn.addEventListener('click', () => this.viewTodoDetails(todo));

        return todoItem;
    }

    toggleTodoComplete(todoId) {
        for (const project of this.projects) {
            const todo = project.getTodo(todoId);
            if (todo) {
                todo.toggleComplete();
                this.saveProjects();
                
                // Check if we're in a filtered view or project view
                if (this.currentView === 'today' || this.currentView === 'week' || this.currentView === 'month') {
                    this.renderFilteredTodos();
                } else {
                    this.renderTodos(project.id);
                }
                break;
            }
        }
    }

    deleteTodo(todoId) {
        this.itemToDelete = { type: 'todo', id: todoId };
        this.deleteDialog.showModal();
    }

    confirmDeleteTodo(todoId) {
        const project = this.projects.find(p => p.todos.some(t => t.id === todoId));
        if (project) {
            project.removeTodo(todoId);
            this.saveProjects();
            this.renderTodos(project.id);
        }
    }

    viewTodoDetails(todo) {
        // Update dialog content
        document.getElementById('detail-title').textContent = todo.title;
        document.getElementById('detail-description').textContent = todo.description || 'No description';
        document.getElementById('detail-project').textContent = todo.projectTitle || 'No project';
        document.getElementById('detail-priority').textContent = todo.priority;
        document.getElementById('detail-due-date').textContent = new Date(todo.dueDate).toLocaleDateString();
        document.getElementById('detail-status').textContent = todo.completed ? 'Completed' : 'Pending';

        // Show dialog
        this.todoDetailsDialog.showModal();
    }

    changeView(view) {
        this.currentView = view;
        
        // Update active button state
        [this.todayBtn, this.thisWeekBtn, this.thisMonthBtn].forEach(btn => {
            btn.classList.remove('active');
        });

        // Deselect any selected project
        const projectItems = this.projectsList.querySelectorAll('.project-item');
        projectItems.forEach(item => item.classList.remove('active'));

        // Set active button and title
        switch(view) {
            case 'today':
                this.todayBtn.classList.add('active');
                document.getElementById('current-view-title').textContent = "Today's Tasks";
                break;
            case 'week':
                this.thisWeekBtn.classList.add('active');
                document.getElementById('current-view-title').textContent = "This Week's Tasks";
                break;
            case 'month':
                this.thisMonthBtn.classList.add('active');
                document.getElementById('current-view-title').textContent = "This Month's Tasks";
                break;
        }

        this.renderFilteredTodos();
    }

    renderFilteredTodos() {
        let allTodos = [];
        this.projects.forEach(project => {
            const projectTodos = project.getAllTodos().map(todo => ({
                ...todo,
                projectTitle: project.title
            }));
            allTodos = allTodos.concat(projectTodos);
        });

        // Filter todos based on current view
        const filteredTodos = allTodos.filter(todo => {
            const dueDate = parseISO(todo.dueDate);
            switch(this.currentView) {
                case 'today':
                    return isToday(dueDate);
                case 'week':
                    return isThisWeek(dueDate);
                case 'month':
                    return isThisMonth(dueDate);
                default:
                    return true;
            }
        });

        if (filteredTodos.length === 0) {
            this.todosContainer.innerHTML = `<div class="empty-state">No tasks for ${this.currentView}</div>`;
            return;
        }

        // Group and render filtered todos
        const todosByDate = this.groupTodosByDate(filteredTodos);
        this.todosContainer.innerHTML = '';
        
        Object.entries(todosByDate).forEach(([date, dateTodos]) => {
            const dateSection = document.createElement('div');
            dateSection.className = 'todos-date-section';
            
            const dateHeader = document.createElement('h2');
            dateHeader.className = 'date-header';
            dateHeader.textContent = date;
            dateSection.appendChild(dateHeader);

            dateTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                dateSection.appendChild(todoElement);
            });

            this.todosContainer.appendChild(dateSection);
        });
    }
} 