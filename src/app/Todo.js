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

    update(data) {
        if (data.title) this.title = data.title;
        if (data.description !== undefined) this.description = data.description;
        if (data.priority) this.priority = data.priority;
        if (data.dueDate) this.dueDate = data.dueDate;
        if (data.completed !== undefined) this.completed = data.completed;
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