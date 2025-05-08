import { Router } from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { authenticate, requireAdmin } from '../middleware/auth';
import { createAdminSchema } from '../utils/validators';
import {
  getAllUsers,
  getUserById,
  createAdmin,
  getAllAdmins,
  getAdminById,
  getAllGroups,
  getGroupById,
} from '../controllers/admin/admin.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:userId', getUserById);

/**
 * @swagger
 * /api/admin/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admins
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admins', getAllAdmins);

/**
 * @swagger
 * /api/admin/admins/{adminId}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Admin details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.get('/admins/:adminId', getAdminById);

/**
 * @swagger
 * /api/admin/admins:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Admin
 *               lastName:
 *                 type: string
 *                 example: User
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123!
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post('/admins', processRequestBody(createAdminSchema), createAdmin);

/**
 * @swagger
 * /api/admin/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/groups', getAllGroups);

/**
 * @swagger
 * /api/admin/groups/{groupId}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Group details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get('/groups/:groupId', getGroupById);

export default router;
