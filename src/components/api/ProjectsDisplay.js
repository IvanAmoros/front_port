import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProjectsDisplay.css";

const ProjectsDisplay = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${apiUrl}/base/projects/`);
                const projectsWithActiveImageIndex = response.data.map(project => ({
                    ...project,
                    activeImageIndex: 0 // Initialize each project with an activeImageIndex
                }));
                setProjects(projectsWithActiveImageIndex);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [apiUrl]);

    const handleImageChange = (projectId, direction) => {
        setProjects(projects =>
            projects.map(project => {
                if (project.id === projectId) {
                    let newIndex = project.activeImageIndex + direction;
                    if (newIndex < 0) {
                        newIndex = project.images.length - 1; // Cycle back to the last image if we go back from the first one
                    } else if (newIndex >= project.images.length) {
                        newIndex = 0; // Cycle back to the first image if we go forward from the last one
                    }
                    return { ...project, activeImageIndex: newIndex };
                }
                return project;
            })
        );
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="projects-display">
            <h2>My Projects</h2>
            {projects.map((project) => (
                <div key={project.id} className="project-item">
                    <h3>{project.title}</h3>
                    <a href={project.github_link} target="_blank" rel="noopener noreferrer">GitHub Link</a>
                    <p className="description">{project.description}</p>
                    <div className="project-images">
                        {project.images.length > 1 && (
                            <>
                                <button className="carousel-control prev" onClick={() => handleImageChange(project.id, -1)}>&lt;</button>
                                <button className="carousel-control next" onClick={() => handleImageChange(project.id, 1)}>&gt;</button>
                            </>
                        )}
                        {project.images.map((image, index) => (
                            <div key={image.id} className={`project-image ${index === project.activeImageIndex ? 'active' : ''}`}>
                                <div className="aspect-ratio-box">
                                    <img src={image.image} alt={image.caption} />
                                </div>
                                <p>{image.caption}</p>
                            </div>
                        ))}
                    </div>
                    <h4>Skills:</h4>
                    <div className="skills">
                        {project.skills.map((skill) => (
                            <span key={skill.id} className="skill-tag">
                                #{skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectsDisplay;
