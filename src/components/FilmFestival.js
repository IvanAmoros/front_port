import React, { useState } from 'react';
import MovieSearch from './MovieSearch';
import MoviesToWatch from './MoviesToWatch';
import FilmsWatched from './FilmsWatched';
import { Typography, Button, Container } from '@mui/material';
import { useAuth } from '../AuthContext';
import LoginModal from './LoginModal';

const FilmFestival = () => {
  const { isLoggedIn, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleOpenLoginModal = () => {
    setLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setLoginModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <Container sx={{ px: 0 }}>
      <Typography 
        variant="h1" 
        component="h1" 
        sx={{ fontFamily: 'Lobster, cursive' }}
      >
        Paral·lel Film Festival
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={isLoggedIn ? handleLogout : handleOpenLoginModal}
        sx={{ mb: 2 }}
      >
        {isLoggedIn ? 'Logout' : 'Login'}
      </Button>
      <FilmsWatched />
      <MoviesToWatch />
      <MovieSearch />
      <LoginModal open={loginModalOpen} onClose={handleCloseLoginModal} />
    </Container>
  );
};

export default FilmFestival;
