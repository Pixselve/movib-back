import {Router} from "express";

const router = Router();

import MovieInteraction from "../../../models/MovieInteraction";
import {celebrate, Joi} from "celebrate";

import {ensureToken} from '../../../controllers/authentification';


/**
 * @api {get} /movies Récupère les films qui sont suivis
 * @apiVersion 1.0.0
 * @apiName GetLibrary
 * @apiGroup Movies
 * @apiPermission Utilisateur
 *
 * @apiSuccess {Object[]} data Données
 * @apiSuccess {String} data._id Identifiant du film.
 * @apiSuccess {String} data.user Identifiant de l'utilisateur.
 * @apiSuccess {Object} data.movie Données du film.
 * @apiSuccess {String} data.movie._id Identifiant.
 * @apiSuccess {String} data.movie.title Titre.
 * @apiSuccess {String} data.movie.imdbId Identifiant IMDB.
 * @apiSuccess {String} data.movie.originalLanguage Langue originale.
 * @apiSuccess {String} data.movie.plot Synopsis.
 * @apiSuccess {Date} data.movie.releaseDate Date de sortie.
 * @apiSuccess {String} data.movie.tmdbId Identifiant TMDB.
 * @apiSuccess {Object} data.movie.backdrop Donnée de l'arrière-plan.
 * @apiSuccess {String} data.movie.backdrop._id Identifiant.
 * @apiSuccess {String} data.movie.backdrop.path Chemin vers l'image.
 * @apiSuccess {String} data.movie.backdrop.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Object} data.movie.poster Donnée du poster.
 * @apiSuccess {String} data.movie.poster._id Identifiant.
 * @apiSuccess {String} data.movie.poster.path Chemin vers l'image.
 * @apiSuccess {String} data.movie.poster.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Boolean} data.movie.followed Si le film est suivi ou non.
 * @apiSuccess {Number} data.movie.rating Note attribuée au film.
 * @apiSuccess {Boolean} data.movie.watched Si le film a été vu ou non.
 * @apiSuccess {Date} data.movie.createdAt Timestamp de la création du film.
 * @apiSuccess {Date} data.movie.updatedAt Timestamp de la mise à jour du film.
 * @apiSuccess {object[]} data.movie.genres Données des genres.
 * @apiSuccess {string} data.movie.genres._id Identifiant.
 * @apiSuccess {string} data.movie.genres.id Identifiant TMDB.
 * @apiSuccess {string} data.movie.genres.name Nom.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     data: [
 *      {
        "_id": "5cb787d7bed72444e175439f",
        "user": "5cb389f48895e07e65398559",
        "movie": {
            "_id": "5cb787d7bed72444e1754397",
            "title": "Rogue One - A Star Wars Story",
            "imdbId": "tt3748528",
            "originalLanguage": "en",
            "plot": "Situé entre les épisodes III et IV de la saga Star Wars, le film nous entraîne aux côtés d’individus ordinaires qui, pour rester fidèles à leurs valeurs, vont tenter l’impossible au péril de leur vie. Ils n’avaient pas prévu de devenir des héros, mais dans une époque de plus en plus sombre, ils vont devoir dérober les plans de l’Étoile de la Mort, l’arme de destruction ultime de l’Empire.",
            "releaseDate": "2016-12-14T00:00:00.000Z",
            "genres": [
                {
                    "_id": "5cb787d7bed72444e175439a",
                    "id": 28,
                    "name": "Action"
                },
                {
                    "_id": "5cb787d7bed72444e1754399",
                    "id": 12,
                    "name": "Aventure"
                },
                {
                    "_id": "5cb787d7bed72444e1754398",
                    "id": 878,
                    "name": "Science-Fiction"
                }
            ],
            "tmdbId": 330459,
            "backdrop": {
                "_id": "5cb787d7bed72444e175439b",
                "path": "/tZjVVIYXACV4IIIhXeIM59ytqwS.jpg",
                "color": "#0045ff"
            },
            "poster": {
                "_id": "5cb787d7bed72444e175439c",
                "path": "/mcwCNjqKUkebvknFkpj0UPdpSj.jpg",
                "color": "#0068ff"
            },
            "__v": 0
        },
        "followed": true,
        "rating": -1,
        "watched": false,
        "createdAt": "2019-04-17T20:08:55.670Z",
        "updatedAt": "2019-05-01T17:33:52.314Z",
        "__v": 0
    }
 *     ]

 */


router.get("/", ensureToken, async (req, res, next) => {
  try {
    const data = await req.user.getLibrary();
    res.status(200).json({data});
  } catch (e) {
    next(e);
  }
});


/**
 * @api {get} /movies/recommendations Recommandations utilisateur
 * @apiVersion 1.0.0
 * @apiName GetRecommendations
 * @apiGroup Movies
 * @apiPermission Utilisateur
 *
 * @apiParam {Number{...10}} limit Limite de recommandation à recevoir.
 *
 * @apiSuccess {String} _id Identifiant du film.
 * @apiSuccess {String} user Identifiant de l'utilisateur.
 * @apiSuccess {Object} movie Données du film.
 * @apiSuccess {String} movie._id Identifiant.
 * @apiSuccess {String} movie.title Titre.
 * @apiSuccess {String} movie.imdbId Identifiant IMDB.
 * @apiSuccess {String} movie.originalLanguage Langue originale.
 * @apiSuccess {String} movie.plot Synopsis.
 * @apiSuccess {Date} movie.releaseDate Date de sortie.
 * @apiSuccess {String} movie.tmdbId Identifiant TMDB.
 * @apiSuccess {Object} movie.backdrop Donnée de l'arrière-plan.
 * @apiSuccess {String} movie.backdrop._id Identifiant.
 * @apiSuccess {String} movie.backdrop.path Chemin vers l'image.
 * @apiSuccess {String} movie.backdrop.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Object} movie.poster Donnée du poster.
 * @apiSuccess {String} movie.poster._id Identifiant.
 * @apiSuccess {String} movie.poster.path Chemin vers l'image.
 * @apiSuccess {String} movie.poster.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Boolean} movie.followed Si le film est suivi ou non.
 * @apiSuccess {Number} movie.rating Note attribuée au film.
 * @apiSuccess {Boolean} movie.watched Si le film a été vu ou non.
 * @apiSuccess {Date} movie.createdAt Timestamp de la création du film.
 * @apiSuccess {Date} movie.updatedAt Timestamp de la mise à jour du film.
 * @apiSuccess {object[]} movie.genres Données des genres.
 * @apiSuccess {string} movie.genres._id Identifiant.
 * @apiSuccess {string} movie.genres.id Identifiant TMDB.
 * @apiSuccess {string} movie.genres.name Nom.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
        "_id": "5cb787d7bed72444e175439f",
        "user": "5cb389f48895e07e65398559",
        "movie": {
            "_id": "5cb787d7bed72444e1754397",
            "title": "Rogue One - A Star Wars Story",
            "imdbId": "tt3748528",
            "originalLanguage": "en",
            "plot": "Situé entre les épisodes III et IV de la saga Star Wars, le film nous entraîne aux côtés d’individus ordinaires qui, pour rester fidèles à leurs valeurs, vont tenter l’impossible au péril de leur vie. Ils n’avaient pas prévu de devenir des héros, mais dans une époque de plus en plus sombre, ils vont devoir dérober les plans de l’Étoile de la Mort, l’arme de destruction ultime de l’Empire.",
            "releaseDate": "2016-12-14T00:00:00.000Z",
            "genres": [
                {
                    "_id": "5cb787d7bed72444e175439a",
                    "id": 28,
                    "name": "Action"
                },
                {
                    "_id": "5cb787d7bed72444e1754399",
                    "id": 12,
                    "name": "Aventure"
                },
                {
                    "_id": "5cb787d7bed72444e1754398",
                    "id": 878,
                    "name": "Science-Fiction"
                }
            ],
            "tmdbId": 330459,
            "backdrop": {
                "_id": "5cb787d7bed72444e175439b",
                "path": "/tZjVVIYXACV4IIIhXeIM59ytqwS.jpg",
                "color": "#0045ff"
            },
            "poster": {
                "_id": "5cb787d7bed72444e175439c",
                "path": "/mcwCNjqKUkebvknFkpj0UPdpSj.jpg",
                "color": "#0068ff"
            },
            "__v": 0
        },
        "followed": true,
        "rating": -1,
        "watched": false,
        "createdAt": "2019-04-17T20:08:55.670Z",
        "updatedAt": "2019-05-01T17:33:52.314Z",
        "__v": 0
    }
 *     ]
 */
router.get('/recommendations', ensureToken, celebrate({
  query: Joi.object().keys({
    limit: Joi.number().max(10).min(1)
  })
}), async (req, res, next) => {
  try {
    const {limit} = req.query;
    const user = req.user;
    const data = await user.getMovieRecommendations(limit || 10);
    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
});

/**
 * @api {get} /movies/discover Suggestion de films en fonction de critères spécifiques
 * @apiVersion 1.0.0
 * @apiName GetDiscoveries
 * @apiGroup Movies
 * @apiPermission Utilisateur
 *
 * @apiParam {String} genres ID des genres séparés par une virgule.
 * @apiParam {Number} year Année de diffusion.
 * @apiParam {String} lang Langue originale.
 *
 * @apiSuccess {Object[]} data Données
 * @apiSuccess {String} data._id Identifiant du film.
 * @apiSuccess {String} data.user Identifiant de l'utilisateur.
 * @apiSuccess {Object} data.movie Données du film.
 * @apiSuccess {String} data.movie._id Identifiant.
 * @apiSuccess {String} data.movie.title Titre.
 * @apiSuccess {String} data.movie.imdbId Identifiant IMDB.
 * @apiSuccess {String} data.movie.originalLanguage Langue originale.
 * @apiSuccess {String} data.movie.plot Synopsis.
 * @apiSuccess {Date} data.movie.releaseDate Date de sortie.
 * @apiSuccess {String} data.movie.tmdbId Identifiant TMDB.
 * @apiSuccess {Object} data.movie.backdrop Donnée de l'arrière-plan.
 * @apiSuccess {String} data.movie.backdrop._id Identifiant.
 * @apiSuccess {String} data.movie.backdrop.path Chemin vers l'image.
 * @apiSuccess {String} data.movie.backdrop.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Object} data.movie.poster Donnée du poster.
 * @apiSuccess {String} data.movie.poster._id Identifiant.
 * @apiSuccess {String} data.movie.poster.path Chemin vers l'image.
 * @apiSuccess {String} data.movie.poster.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Boolean} data.movie.followed Si le film est suivi ou non.
 * @apiSuccess {Number} data.movie.rating Note attribuée au film.
 * @apiSuccess {Boolean} data.movie.watched Si le film a été vu ou non.
 * @apiSuccess {Date} data.movie.createdAt Timestamp de la création du film.
 * @apiSuccess {Date} data.movie.updatedAt Timestamp de la mise à jour du film.
 * @apiSuccess {object[]} data.movie.genres Données des genres.
 * @apiSuccess {string} data.movie.genres._id Identifiant.
 * @apiSuccess {string} data.movie.genres.id Identifiant TMDB.
 * @apiSuccess {string} data.movie.genres.name Nom.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     data: [
 *      {
        "_id": "5cb787d7bed72444e175439f",
        "user": "5cb389f48895e07e65398559",
        "movie": {
            "_id": "5cb787d7bed72444e1754397",
            "title": "Rogue One - A Star Wars Story",
            "imdbId": "tt3748528",
            "originalLanguage": "en",
            "plot": "Situé entre les épisodes III et IV de la saga Star Wars, le film nous entraîne aux côtés d’individus ordinaires qui, pour rester fidèles à leurs valeurs, vont tenter l’impossible au péril de leur vie. Ils n’avaient pas prévu de devenir des héros, mais dans une époque de plus en plus sombre, ils vont devoir dérober les plans de l’Étoile de la Mort, l’arme de destruction ultime de l’Empire.",
            "releaseDate": "2016-12-14T00:00:00.000Z",
            "genres": [
                {
                    "_id": "5cb787d7bed72444e175439a",
                    "id": 28,
                    "name": "Action"
                },
                {
                    "_id": "5cb787d7bed72444e1754399",
                    "id": 12,
                    "name": "Aventure"
                },
                {
                    "_id": "5cb787d7bed72444e1754398",
                    "id": 878,
                    "name": "Science-Fiction"
                }
            ],
            "tmdbId": 330459,
            "backdrop": {
                "_id": "5cb787d7bed72444e175439b",
                "path": "/tZjVVIYXACV4IIIhXeIM59ytqwS.jpg",
                "color": "#0045ff"
            },
            "poster": {
                "_id": "5cb787d7bed72444e175439c",
                "path": "/mcwCNjqKUkebvknFkpj0UPdpSj.jpg",
                "color": "#0068ff"
            },
            "__v": 0
        },
        "followed": true,
        "rating": -1,
        "watched": false,
        "createdAt": "2019-04-17T20:08:55.670Z",
        "updatedAt": "2019-05-01T17:33:52.314Z",
        "__v": 0
    }
 *     ]

 */

router.get("/discover", ensureToken, celebrate({
  query: Joi.object().keys({
    genres: Joi.string().regex(/^\d+(,\d+)*$/m),
    year: Joi.number().min(1500),
    lang: Joi.string()
  })
}), async (req, res, next) => {
  try {
    const {genres, year, lang} = req.query;
    const data = await MovieInteraction.discover(req.user._id, {genres, lang, year});
    res.status(200).json({data});
  } catch (e) {
    next(e);
  }
});

/**
 * @api {get} /movies/search Recherche d'un film
 * @apiVersion 1.0.0
 * @apiName GetSearch
 * @apiGroup Movies
 * @apiPermission Utilisateur
 *
 * @apiParam {String} q Recherche.
 * @apiParam {Number} year Année de diffusion.
 *
 * @apiSuccess {String} _id Identifiant du film.
 * @apiSuccess {String} user Identifiant de l'utilisateur.
 * @apiSuccess {Object} movie Données du film.
 * @apiSuccess {String} movie._id Identifiant.
 * @apiSuccess {String} movie.title Titre.
 * @apiSuccess {String} movie.imdbId Identifiant IMDB.
 * @apiSuccess {String} movie.originalLanguage Langue originale.
 * @apiSuccess {String} movie.plot Synopsis.
 * @apiSuccess {Date} movie.releaseDate Date de sortie.
 * @apiSuccess {String} movie.tmdbId Identifiant TMDB.
 * @apiSuccess {Object} movie.backdrop Donnée de l'arrière-plan.
 * @apiSuccess {String} movie.backdrop._id Identifiant.
 * @apiSuccess {String} movie.backdrop.path Chemin vers l'image.
 * @apiSuccess {String} movie.backdrop.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Object} movie.poster Donnée du poster.
 * @apiSuccess {String} movie.poster._id Identifiant.
 * @apiSuccess {String} movie.poster.path Chemin vers l'image.
 * @apiSuccess {String} movie.poster.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Boolean} movie.followed Si le film est suivi ou non.
 * @apiSuccess {Number} movie.rating Note attribuée au film.
 * @apiSuccess {Boolean} movie.watched Si le film a été vu ou non.
 * @apiSuccess {Date} movie.createdAt Timestamp de la création du film.
 * @apiSuccess {Date} movie.updatedAt Timestamp de la mise à jour du film.
 * @apiSuccess {object[]} movie.genres Données des genres.
 * @apiSuccess {string} movie.genres._id Identifiant.
 * @apiSuccess {string} movie.genres.id Identifiant TMDB.
 * @apiSuccess {string} movie.genres.name Nom.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {
        "_id": "5cb787d7bed72444e175439f",
        "user": "5cb389f48895e07e65398559",
        "movie": {
            "_id": "5cb787d7bed72444e1754397",
            "title": "Rogue One - A Star Wars Story",
            "imdbId": "tt3748528",
            "originalLanguage": "en",
            "plot": "Situé entre les épisodes III et IV de la saga Star Wars, le film nous entraîne aux côtés d’individus ordinaires qui, pour rester fidèles à leurs valeurs, vont tenter l’impossible au péril de leur vie. Ils n’avaient pas prévu de devenir des héros, mais dans une époque de plus en plus sombre, ils vont devoir dérober les plans de l’Étoile de la Mort, l’arme de destruction ultime de l’Empire.",
            "releaseDate": "2016-12-14T00:00:00.000Z",
            "genres": [
                {
                    "_id": "5cb787d7bed72444e175439a",
                    "id": 28,
                    "name": "Action"
                },
                {
                    "_id": "5cb787d7bed72444e1754399",
                    "id": 12,
                    "name": "Aventure"
                },
                {
                    "_id": "5cb787d7bed72444e1754398",
                    "id": 878,
                    "name": "Science-Fiction"
                }
            ],
            "tmdbId": 330459,
            "backdrop": {
                "_id": "5cb787d7bed72444e175439b",
                "path": "/tZjVVIYXACV4IIIhXeIM59ytqwS.jpg",
                "color": "#0045ff"
            },
            "poster": {
                "_id": "5cb787d7bed72444e175439c",
                "path": "/mcwCNjqKUkebvknFkpj0UPdpSj.jpg",
                "color": "#0068ff"
            },
            "__v": 0
        },
        "followed": true,
        "rating": -1,
        "watched": false,
        "createdAt": "2019-04-17T20:08:55.670Z",
        "updatedAt": "2019-05-01T17:33:52.314Z",
        "__v": 0
    }
 *     ]

 */


router.get("/search", ensureToken, celebrate({
  query: Joi.object().keys({
    q: Joi.string().required(),
    year: Joi.string()
  })
}), async (req, res, next) => {
  try {
    const {q, year} = req.query;
    const data = await MovieInteraction.search(req.user._id, {q, year});
    res.status(200).json({data});
  } catch (e) {
    next(e);
  }
});
/**
 * @api {get} /movies/:id Informations sur un film spécifique
 * @apiVersion 1.0.0
 * @apiName GetMovie
 * @apiGroup Movies
 * @apiPermission Utilisateur
 *
 * @apiSuccess {String} _id Identifiant du film.
 * @apiSuccess {String} user Identifiant de l'utilisateur.
 * @apiSuccess {Object} movie Données du film.
 * @apiSuccess {String} movie._id Identifiant.
 * @apiSuccess {String} movie.title Titre.
 * @apiSuccess {String} movie.imdbId Identifiant IMDB.
 * @apiSuccess {String} movie.originalLanguage Langue originale.
 * @apiSuccess {String} movie.plot Synopsis.
 * @apiSuccess {Date} movie.releaseDate Date de sortie.
 * @apiSuccess {String} movie.tmdbId Identifiant TMDB.
 * @apiSuccess {Object} movie.backdrop Donnée de l'arrière-plan.
 * @apiSuccess {String} movie.backdrop._id Identifiant.
 * @apiSuccess {String} movie.backdrop.path Chemin vers l'image.
 * @apiSuccess {String} movie.backdrop.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Object} movie.poster Donnée du poster.
 * @apiSuccess {String} movie.poster._id Identifiant.
 * @apiSuccess {String} movie.poster.path Chemin vers l'image.
 * @apiSuccess {String} movie.poster.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Boolean} movie.followed Si le film est suivi ou non.
 * @apiSuccess {Number} movie.rating Note attribuée au film.
 * @apiSuccess {Boolean} movie.watched Si le film a été vu ou non.
 * @apiSuccess {Date} movie.createdAt Timestamp de la création du film.
 * @apiSuccess {Date} movie.updatedAt Timestamp de la mise à jour du film.
 * @apiSuccess {object[]} movie.genres Données des genres.
 * @apiSuccess {string} movie.genres._id Identifiant.
 * @apiSuccess {string} movie.genres.id Identifiant TMDB.
 * @apiSuccess {string} movie.genres.name Nom.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK

 *      {
        "_id": "5cb787d7bed72444e175439f",
        "user": "5cb389f48895e07e65398559",
        "movie": {
            "_id": "5cb787d7bed72444e1754397",
            "title": "Rogue One - A Star Wars Story",
            "imdbId": "tt3748528",
            "originalLanguage": "en",
            "plot": "Situé entre les épisodes III et IV de la saga Star Wars, le film nous entraîne aux côtés d’individus ordinaires qui, pour rester fidèles à leurs valeurs, vont tenter l’impossible au péril de leur vie. Ils n’avaient pas prévu de devenir des héros, mais dans une époque de plus en plus sombre, ils vont devoir dérober les plans de l’Étoile de la Mort, l’arme de destruction ultime de l’Empire.",
            "releaseDate": "2016-12-14T00:00:00.000Z",
            "genres": [
                {
                    "_id": "5cb787d7bed72444e175439a",
                    "id": 28,
                    "name": "Action"
                },
                {
                    "_id": "5cb787d7bed72444e1754399",
                    "id": 12,
                    "name": "Aventure"
                },
                {
                    "_id": "5cb787d7bed72444e1754398",
                    "id": 878,
                    "name": "Science-Fiction"
                }
            ],
            "tmdbId": 330459,
            "backdrop": {
                "_id": "5cb787d7bed72444e175439b",
                "path": "/tZjVVIYXACV4IIIhXeIM59ytqwS.jpg",
                "color": "#0045ff"
            },
            "poster": {
                "_id": "5cb787d7bed72444e175439c",
                "path": "/mcwCNjqKUkebvknFkpj0UPdpSj.jpg",
                "color": "#0068ff"
            },
            "__v": 0
        },
        "followed": true,
        "rating": -1,
        "watched": false,
        "createdAt": "2019-04-17T20:08:55.670Z",
        "updatedAt": "2019-05-01T17:33:52.314Z",
        "__v": 0
    }
 */

router.get('/:id', ensureToken, async (req, res, next) => {
  try {
    const {id} = req.params;
    const user = req.user;
    const movie = await MovieInteraction.findOrCreate(user._id, parseInt(id));
    res.status(200).json(movie);
  } catch (e) {
    next(e);
  }
});
/**
 * @api {post} /movies/:id/update Mise à jour des informations concernant un utilisateur sur un film
 * @apiVersion 1.0.0
 * @apiName PostMovie
 * @apiGroup Movies
 * @apiPermission Utilisateur

 * @apiParam {Boolean} watched Si le film a été vu ou non.
 * @apiParam {Boolean} followed Si le film est suivi ou non.
 * @apiParam {Number} rating Note attribuée au film.
 *
 * @apiSuccess {String} _id Identifiant du film.
 * @apiSuccess {String} user Identifiant de l'utilisateur.
 * @apiSuccess {Object} movie Données du film.
 * @apiSuccess {String} movie._id Identifiant.
 * @apiSuccess {String} movie.title Titre.
 * @apiSuccess {String} movie.imdbId Identifiant IMDB.
 * @apiSuccess {String} movie.originalLanguage Langue originale.
 * @apiSuccess {String} movie.plot Synopsis.
 * @apiSuccess {Date} movie.releaseDate Date de sortie.
 * @apiSuccess {String} movie.tmdbId Identifiant TMDB.
 * @apiSuccess {Object} movie.backdrop Donnée de l'arrière-plan.
 * @apiSuccess {String} movie.backdrop._id Identifiant.
 * @apiSuccess {String} movie.backdrop.path Chemin vers l'image.
 * @apiSuccess {String} movie.backdrop.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Object} movie.poster Donnée du poster.
 * @apiSuccess {String} movie.poster._id Identifiant.
 * @apiSuccess {String} movie.poster.path Chemin vers l'image.
 * @apiSuccess {String} movie.poster.color Couleur prédominante et saturée de l'image.
 * @apiSuccess {Boolean} movie.followed Si le film est suivi ou non.
 * @apiSuccess {Number} movie.rating Note attribuée au film.
 * @apiSuccess {Boolean} movie.watched Si le film a été vu ou non.
 * @apiSuccess {Date} movie.createdAt Timestamp de la création du film.
 * @apiSuccess {Date} movie.updatedAt Timestamp de la mise à jour du film.
 * @apiSuccess {object[]} movie.genres Données des genres.
 * @apiSuccess {string} movie.genres._id Identifiant.
 * @apiSuccess {string} movie.genres.id Identifiant TMDB.
 * @apiSuccess {string} movie.genres.name Nom.
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *      {
        "_id": "5cb787d7bed72444e175439f",
        "user": "5cb389f48895e07e65398559",
        "movie": {
            "_id": "5cb787d7bed72444e1754397",
            "title": "Rogue One - A Star Wars Story",
            "imdbId": "tt3748528",
            "originalLanguage": "en",
            "plot": "Situé entre les épisodes III et IV de la saga Star Wars, le film nous entraîne aux côtés d’individus ordinaires qui, pour rester fidèles à leurs valeurs, vont tenter l’impossible au péril de leur vie. Ils n’avaient pas prévu de devenir des héros, mais dans une époque de plus en plus sombre, ils vont devoir dérober les plans de l’Étoile de la Mort, l’arme de destruction ultime de l’Empire.",
            "releaseDate": "2016-12-14T00:00:00.000Z",
            "genres": [
                {
                    "_id": "5cb787d7bed72444e175439a",
                    "id": 28,
                    "name": "Action"
                },
                {
                    "_id": "5cb787d7bed72444e1754399",
                    "id": 12,
                    "name": "Aventure"
                },
                {
                    "_id": "5cb787d7bed72444e1754398",
                    "id": 878,
                    "name": "Science-Fiction"
                }
            ],
            "tmdbId": 330459,
            "backdrop": {
                "_id": "5cb787d7bed72444e175439b",
                "path": "/tZjVVIYXACV4IIIhXeIM59ytqwS.jpg",
                "color": "#0045ff"
            },
            "poster": {
                "_id": "5cb787d7bed72444e175439c",
                "path": "/mcwCNjqKUkebvknFkpj0UPdpSj.jpg",
                "color": "#0068ff"
            },
            "__v": 0
        },
        "followed": true,
        "rating": -1,
        "watched": false,
        "createdAt": "2019-04-17T20:08:55.670Z",
        "updatedAt": "2019-05-01T17:33:52.314Z",
        "__v": 0
    }

 */

router.post('/:id/update', ensureToken, celebrate({
  body: Joi.object().keys({
    watched: Joi.boolean(),
    followed: Joi.boolean(),
    rating: Joi.number().integer().min(0).max(5)
  })
}), async (req, res, next) => {
  try {
    const {id} = req.params;
    const user = req.user;
    const {watched, followed, rating} = req.body;
    const movieInteraction = await MovieInteraction.update(user._id, id, {watched, followed, rating});
    res.status(200).json(movieInteraction);
  } catch (e) {
    next(e);
  }
});


module.exports = router;
