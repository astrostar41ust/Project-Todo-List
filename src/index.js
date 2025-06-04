// src/index.js
import './styles.css';
import ProjectManager from './app/ProjectManager';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize main components
    const projectManager = new ProjectManager();

    // Update current date in header
    const currentDateElement = document.getElementById('current-date');
    const today = new Date();
    currentDateElement.textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    // Initialize view buttons
    const viewButtons = {
        'today-btn': 'Today',
        'this-week-btn': 'This Week',
        'this-month-btn': 'This Month'
    };

    Object.entries(viewButtons).forEach(([id, title]) => {
        const button = document.getElementById(id);
        button.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.nav-button').forEach(btn => 
                btn.classList.toggle('active', btn === button)
            );

            // Update view title
            document.getElementById('current-view-title').textContent = title;

            // TODO: Implement filtering logic for each view
            // This will be handled by the project manager in a future update
        });
    });
});



