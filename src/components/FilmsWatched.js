import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SkeletonLoading from './SkeletonLoading'
import {
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    CardActions,
    Rating,
    Snackbar,
    Alert,
    CardActionArea,
    Collapse,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    Box,
    Fade,
    Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../AuthContext';

const api_url = process.env.REACT_APP_API_URL;

const FilmsWatched = () => {
    const { isLoggedIn, accessToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [filmsWatched, setFilmsWatched] = useState([]);
    const [userRatedFilms, setUserRatedFilms] = useState(new Set());
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [expanded, setExpanded] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const fetchFilms = async () => {
            setLoading(true);
            try {
                const response = await api.get(`${api_url}/film-festival/films-watched/`);
                setFilmsWatched(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        const fetchUserRatedFilms = async () => {
            if (isLoggedIn) {
                try {
                    const response = await api.get(`${api_url}/film-festival/user-rated-films/`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    const ratedFilmIds = new Set(response.data.map(film => film.id));
                    setUserRatedFilms(ratedFilmIds);
                } catch (error) {
                    console.error('Error fetching user rated films:', error);
                }
            }
        };

        fetchFilms();
        fetchUserRatedFilms();
    }, [isLoggedIn, accessToken]);

    const handleRating = async (newValue, filmId) => {
        try {
            const postData = { stars: newValue };
            await api.post(`${api_url}/film-festival/create-rating/${filmId}/`, postData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const updatedFilms = filmsWatched.map(film => {
                if (film.id === filmId) {
                    const newVoteCount = film.ratings.length + 1;
                    const newRatings = [...film.ratings, { stars: newValue, user: 'current_user' }];
                    const newAverage = newRatings.reduce((acc, curr) => acc + curr.stars, 0) / newRatings.length;
                    return { ...film, average_rating: newAverage, ratings: newRatings, vote_count: newVoteCount };
                }
                return film;
            });
            setFilmsWatched(updatedFilms);
            setUserRatedFilms(new Set(userRatedFilms).add(filmId));
            setRating(0);
            setSnackbarMessage(`Has votado con un ${newValue}`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setOpenModal(false);
        } catch (error) {
            console.error('Error posting rating:', error);
            setSnackbarMessage('Error al enviar la valoración');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleExpandClick = (filmId) => {
        setExpanded(prevState => ({ ...prevState, [filmId]: !prevState[filmId] }));
    };

    const openRatingModal = (film) => {
        if (isLoggedIn) {
            setSelectedFilm(film);
            setOpenModal(true);
        } else {
            setSnackbarMessage('Debe iniciar sesión primero para valorar una película');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
        }
    };

    const closeModal = () => {
        setOpenModal(false);
        setSelectedFilm(null);
        setRating(0);
    };

    const formatVotes = (votes) => {
        if (!votes) return 'N/A';
        const numericVotes = parseInt(votes.replace(/,/g, ''), 10);
        if (numericVotes >= 1000000) {
            return (numericVotes / 1000000).toFixed(1).replace('.', ',') + ' M';
        } else if (numericVotes >= 1000) {
            return (numericVotes / 1000).toFixed(1).replace('.', ',') + ' mil';
        }
        return numericVotes.toString();
    };

    const formatGenres = (genres) => {
        if (!genres || genres.length === 0) return 'N/A';
        return genres.map(g => g.name).join(', ');
    };

    return (
        <Container sx={{ px: 0.5, mb: 5 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Ya vistas
            </Typography>
            {loading ? (
                <SkeletonLoading />
            ) : (
                <Fade in={true} timeout={1000}>
                    <Grid container spacing={0.5}>
                        {filmsWatched.map((film) => (
                            <Grid item xs={6} sm={4} md={3} key={film.id}>
                                <Card>
                                    <CardActionArea sx={{ backgroundColor: '#e7f0fe' }}  onClick={() => handleExpandClick(film.id)}>
                                        <Box sx={{ position: 'relative', paddingTop: '150%' }}>
                                            <CardMedia
                                                component="img"
                                                image={film.image}
                                                alt={`${film.tittle} Poster`}
                                                loading="lazy"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </Box>
                                        <CardContent
                                            sx={{
                                                padding: 0,
                                                paddingTop: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'end' }}>
                                                <Chip
                                                    sx={{ borderRadius: 2, color: 'white', fontSize: 20, fontWeight: 'bold', maxWidth: 100, backgroundColor: '#4682B4' }}
                                                    label={film.average_rating.toFixed(2)}
                                                />
                                                <Typography variant="subtitle1">
                                                    <PersonIcon sx={{ fontSize: 'medium' }} /> {film.vote_count}
                                                </Typography>
                                            </Box>
                                            <Rating
                                                name="read-only"
                                                value={film.average_rating / 2}
                                                readOnly
                                                precision={0.1}
                                                max={5}
                                            />
                                        </CardContent>
                                    </CardActionArea>
                                    <Collapse sx={{ backgroundColor: '#e7f0fe' }} in={expanded[film.id]} timeout="auto" unmountOnExit>
                                        <CardContent>
                                            <Typography variant="subtitle1">
                                                Vista: {film.watched_date}
                                            </Typography>
                                            {film.ratings && (
                                                <Box sx={{ mb: 1 }}>
                                                    {film.ratings.map((rating) => (
                                                        <Typography
                                                            key={rating.id}
                                                            variant="body2"
                                                            color="textSecondary"
                                                            sx={{ textAlign: 'left' }}
                                                        >
                                                            {rating.user}: {rating.stars}/10
                                                        </Typography>
                                                    ))}
                                                </Box>
                                            )}
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ textAlign: 'justify', mb: 1 }}
                                            >
                                                {film.description}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ textAlign: 'left', mb: 1 }}
                                            >
                                                Genre: {formatGenres(film.genres)}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ textAlign: 'left', mb: 1 }}
                                            >
                                                Director: {film.director}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ textAlign: 'left', mb: 1 }}
                                            >
                                                Actors: {film.actors}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ textAlign: 'left', mb: 1 }}
                                            >
                                                Year: {film.year}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ textAlign: 'left', mb: 1 }}
                                            >
                                                Runtime: {film.runtime}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{ textAlign: 'left', mb: 1 }}>
                                                IMDb: {film.imdb_rating}/10 ({formatVotes(film.imdb_votes)} votos)
                                            </Typography>
                                            {film.providers && film.providers.length > 0 && (
                                                <Box>
                                                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'left', mb: 1 }}>
                                                        Available on:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.2 }}>
                                                        {film.providers.map(provider => (
                                                            <img
                                                                key={provider.id}
                                                                src={provider.image_url}
                                                                alt={provider.name}
                                                                style={{ width: 48, height: 48, borderRadius: 10 }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Collapse>
                                    <CardActions sx={{ justifyContent: 'center', padding: 1, backgroundColor: '#e7f0fe' }}>
                                        <Button
                                            sx={{ backgroundColor: userRatedFilms.has(film.id) ? 'secondary' : '#5CB6FF', borderRadius: 4 }}
                                            fullWidth
                                            variant="contained"
                                            onClick={() => openRatingModal(film)}
                                            disabled={userRatedFilms.has(film.id)}
                                        >
                                            {userRatedFilms.has(film.id) ? 'Ya valorada' : 'Valorar'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Fade>
            )}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Dialog open={openModal} onClose={closeModal}>
                <DialogTitle>Valorar película</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {selectedFilm && selectedFilm.tittle}
                    </DialogContentText>
                    <Rating
                        name="rating-controlled"
                        value={rating}
                        onChange={(event, newValue) => setRating(newValue)}
                        max={10}
                        precision={1}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal} color="primary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => handleRating(rating, selectedFilm.id)}
                        color="primary"
                    >
                        Valorar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default FilmsWatched;
