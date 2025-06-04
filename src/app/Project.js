export default class Project {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.todos = [];
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    removeTodo(todoId) {
        const index = this.todos.findIndex(todo => todo.id === todoId);
        if (index !== -1) {
            this.todos.splice(index, 1);
        }
    }

    getTodo(todoId) {
        return this.todos.find(todo => todo.id === todoId);
    }

    getAllTodos() {
        return [...this.todos];
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            todos: this.todos.map(todo => todo.toJSON())
        };
    }
} 