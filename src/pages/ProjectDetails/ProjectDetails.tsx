import React from 'react';
import { Box, Typography, Card, CardMedia, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { projects } from '../../outils/projects';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const currentIndex = projects.findIndex(
    (projects) => projects.title.replace(/\s+/g, '-').toLowerCase() === projectId
  );

  if (currentIndex === -1) {
    return <Typography>Project not found</Typography>;
  }

  const project = projects[currentIndex];
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;

  return (
    <Box sx={{ padding: '60px 20px' }}>
      <Typography variant="h3" sx={{ textAlign: 'center', color: '#A09586', marginBottom: 2 }}>
        {project.title}
      </Typography>
      <Typography variant="body1" sx={{ textAlign: 'justify', color: '#333' }}>
        {project.description}
      </Typography>
      <Card sx={{ boxShadow: 0, borderRadius: 0, marginTop: 4 }}>
        <CardMedia component="img" image={project.image} alt={project.title} sx={{ width: '100%', height: 'auto' }} />
      </Card>

      {/* Navegación entre proyectos */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        {prevProject && (
          <Button
            onClick={() => navigate(`/projects/${prevProject.title.replace(/\s+/g, '-').toLowerCase()}`)}
          >
            ← {prevProject.title}
          </Button>
        )}
        {nextProject && (
          <Button
            onClick={() => navigate(`/projects/${nextProject.title.replace(/\s+/g, '-').toLowerCase()}`)}
          >
            {nextProject.title} →
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ProjectDetailPage;