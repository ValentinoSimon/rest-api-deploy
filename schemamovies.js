const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'El titulo debe ser un string',
        required_error: 'El titulo es requerido'
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().positive().min(0).max(10),
    poster: z.string().url({
        message: 'El poster debe ser una URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
        {
            required_error: 'El genero es requerido',
            invalid_type_error: 'El genero debe ser un array de strings'
        }
    )
})

function validateMovie (object) {
    return movieSchema.parse(object)
}

function validatePartialMovie (object) {
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    movieSchema,
    validatePartialMovie
}
