export default class Storage {
    static STORAGE_KEY = 'todo-app-data';

    static saveProjects(projects) {
        if (!Array.isArray(projects)) {
            console.error('Invalid projects data:', projects);
            return;
        }

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            // Try to clear some space
            try {
                localStorage.clear();
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
            } catch (e) {
                console.error('Failed to save even after clearing storage:', e);
            }
        }
    }

    static getProjects() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return [];

            const projects = JSON.parse(data);
            if (!Array.isArray(projects)) {
                console.error('Invalid data format in storage');
                return [];
            }

            return projects;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    }
} 