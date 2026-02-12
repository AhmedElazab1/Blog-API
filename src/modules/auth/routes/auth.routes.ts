import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  googleCallback,
  getCurrentUser,
  getActiveSessions,
} from '../controllers/auth.controller';
import { userRegisterSchema } from '../validation/Auth.validation';
import { userLoginSchema } from '../validation/Auth.validation';
import { validate } from '../../../common/middlewares/index';
import { UserRole } from '../../../models/types/types';
import { authorize } from '../../../common/middlewares/restrictedTo';
import authenticate from '../../../common/middlewares/protect';
import passport from '../../../config/passport.config';
import { loginLimiter, refreshLimiter } from '../../../config/limiter';

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Sign up
 *     description: Create a new user account using email and password
 *     tags: [Auth]
 *     security: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 12345678
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 65f1c2a9e8b1a2c3d4e5f678
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     username:
 *                       type: string
 *                       example: John Doe
 *
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/register', validate({ body: userRegisterSchema }), register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     description: Login a user using email and password
 *     tags: [Auth]
 *     security: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 12345678
 *
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         set-cookie:
 *           - name: refreshToken
 *             value: <refreshToken>
 *             httpOnly: true
 *             secure: false
 *             sameSite: strict
 *             maxAge: <maxAge>
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 65f1c2a9e8b1a2c3d4e5f678
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         username:
 *                           type: string
 *                           example: John Doe
 *                         role:
 *                           type: string
 *                           example: user
 *                         socialLinks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               website:
 *                                 type: string
 *                                 example: johndoe
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/login', validate({ body: userLoginSchema }), loginLimiter, login);

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Login with Google
 *     description: Redirects to Google's authentication page for user login
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirect to Google's authentication page
 *
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'], session: false }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleCallback,
);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Use the refresh token stored in HttpOnly cookie to generate a new access token. Also rotates the refresh token.
 *     tags: [Auth]
 *     security: []   # Public endpoint
 *
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             description: HttpOnly cookie containing the new refresh token
 *             schema:
 *               type: string
 *               example: refreshToken=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       401:
 *         description: Refresh token not found or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Internal server error
 */

router.post('/refresh', refreshLimiter, refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Logout the user by blacklisting the access token and revoking the refresh token. Clears the refresh token cookie.
 *     tags: [Auth]
 *
 *     security:
 *       - bearerAuth: []   # Requires access token
 *
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token cookie cleared
 *             schema:
 *               type: string
 *               example: refreshToken=; Path=/; HttpOnly; Max-Age=0
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User logged out successfully
 *
 *       401:
 *         description: Refresh token not found or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       403:
 *         description: Access token invalid or blacklisted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Internal server error
 */

router.use(authenticate);

router.post('/logout', logout);

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: Logout All Users
 *     description: Blacklist the current access token and revoke all refresh tokens for the user. Clears the refresh token cookie.
 *     tags: [Auth]
 *
 *     security:
 *       - bearerAuth: []   # Requires access token
 *
 *     responses:
 *       200:
 *         description: User logged out from all sessions successfully
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token cookie cleared
 *             schema:
 *               type: string
 *               example: refreshToken=; Path=/; HttpOnly; Max-Age=0
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User logged out successfully
 *
 *       401:
 *         description: Access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       403:
 *         description: Access token blacklisted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Internal server error
 */

router.post('/logout-all', logoutAll);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get Me
 *     description: Retrieve the authenticated user's information.
 *     tags: [Auth]
 *
 *     security:
 *       - bearerAuth: []   # Requires access token
 *
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: 65f1c2a9e8b1a2c3d4e5f678
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         username:
 *                           type: string
 *                           example: John Doe
 *                         role:
 *                           type: string
 *                           example: user
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         socialLinks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               website:
 *                                 type: string
 *                                 example: johndoe
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get('/me', getCurrentUser);

/**
 * @swagger
 * /api/v1/auth/sessions:
 *   get:
 *     summary: Get active sessions
 *     description: Retrieve all active sessions for the authenticated user.
 *     tags: [Auth]
 *
 *     security:
 *       - bearerAuth: []   # Requires access token
 *
 *     responses:
 *       200:
 *         description: Active sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Active sessions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: 65f1c2a9e8b1a2c3d4e5f678
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-02-07T20:00:00.000Z
 *
 *       401:
 *         description: Access token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *       500:
 *         description: Internal server error
 */

router.get('/sessions', authorize(UserRole.ADMIN), getActiveSessions);

export default router;
