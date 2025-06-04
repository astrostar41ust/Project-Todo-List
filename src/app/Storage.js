export default class Storage {
    static STORAGE_KEY = 'todo-app-data';

    static saveProjects(projects) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    static getProjects() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    }

} 