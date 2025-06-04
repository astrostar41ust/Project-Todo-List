export default class Todo {
    constructor(id, title, description, projectId, priority, dueDate) {
        this.id = id;
        this.title = title;
        this.description = description || '';
        this.projectId = projectId;
        this.priority = priority;
        this.dueDate = dueDate;
        this.completed = false;
        this.createdAt = new Date().toISOString();
    }

    toggleComplete() {
        this.completed = !this.completed;
    }


    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            projectId: this.projectId,
            priority: this.priority,
            dueDate: this.dueDate,
            completed: this.completed,
            createdAt: this.createdAt
        };
    }
} 