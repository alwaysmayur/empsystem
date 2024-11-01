
/**
 * Array of routes which is accessible to public
 * This routes does not require authentication 
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
]


/**
 * Array of routes that are used for authentication
 * This routes will redirect users to settings 
 * @type {string[]}
 */
export const authRoutes = [
    "/emp/login",
    "/emp/register",
]

/**
 * That prefix for api authentication routes
 * Route that start with this prefix used for authentication purpose
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth"

/**
 * Default path afteruser login redirect
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/settings"