const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies') // Importar el módulo movies.js
const { movieSchema , validatePartialMovie } = require('./schemamovies') // Import movieSchema
const app = express()

app.use(express.json())

app.disable('x-powered-by') // Deshabilitar la cabecera X-Powered-By

const AcceptedOrigins = ['http://localhost:3000', 'http://localhost:8080']

app.get('/movies', (req, res) => {
    const { origin } = req.headers
    if (AcceptedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', '*')
    } else {
        res.send('No se permiten peticiones de origen no permitidos')
    }

    const { genre } = req.query
    if (genre) {
        const FilteredMovies = movies.filter((movie) => {
            return movie.genre.some(g => g.toLowerCase() === genre.toLocaleLowerCase())
        })
        if (FilteredMovies.length !== 0) {
            return res.json(FilteredMovies)
        } else {
            return res.send('El genero especificado no se encuentra en la taquilla')
        }
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)
    else res.status(400).json({ message: 'Movie not Found ' })
})

app.post('/movies', (req, res) => {
    const result = movieSchema.safeParse(req.body) // Use movieSchema for validation

    if (!result.success) {
        return res.status(400).json(result.error)
    }

    const NewMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }

    movies.push(NewMovie)

    res.status(201).json(NewMovie)
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieindex = movies.findIndex(movie => movie.id === id)

    if (movieindex === -1) {
        return res.status(400).json({ message: 'Movie not found' })
    }

    const UpdateMovie = {
        ...movies[movieindex],
        ...result.data
    }

    movies[movieindex] = UpdateMovie

    return res.json(UpdateMovie)
})

app.delete('/movies/:id', (req, res) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const { id } = req.params
    const movieIndex = movies.findIndex((movie) => movie.id === id)

    if (movieIndex === -1) {
        return res.status(400).json({ message: 'Esta Pelicula no existe' })
    }

    movies.splice(movieIndex, 1)

    return res.status(200).json({ message: 'Película eliminada correctamente' })
})

app.options('/movies/:id', (req, res) => {
    const { origin } = req.headers
    if (AcceptedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Content-Type')
        res.status(204).send()
    } else {
        res.send('No se permiten peticiones de origen no permitidos')
    }
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
    console.log('Server listening in port', PORT)
})
