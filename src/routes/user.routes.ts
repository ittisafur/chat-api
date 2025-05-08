import { Router } from 'express';
import { processRequestBody } from 'zod-express-middleware';
import { authenticate, requireUser } from '../middleware/auth';
import { createGroupSchema, joinGroupSchema } from '../utils/validators';
import {
  getProfile,
  getAllUsers,
  createGroup,
  joinGroup,
  leaveGroup,
  getGroups,
  getGroupMembers,
} from '../controllers/user/user.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /api/users/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Group
 *     responses:
 *       201:
 *         description: Group created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/groups', processRequestBody(createGroupSchema), createGroup);

/**
 * @swagger
 * /api/users/groups:
 *   get:
 *     summary: Get user's groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/groups', getGroups);

/**
 * @swagger
 * /api/users/groups/{groupId}/join:
 *   post:
 *     summary: Join a group
 *     tags: [Groups]
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
 *         description: Joined group
 *       400:
 *         description: Already a member
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.post('/groups/:groupId/join', joinGroup);

/**
 * @swagger
 * /api/users/groups/{groupId}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
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
 *         description: Left group
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not a member or group not found
 *       500:
 *         description: Server error
 */
router.post('/groups/:groupId/leave', leaveGroup);

/**
 * @swagger
 * /api/users/groups/{groupId}/members:
 *   get:
 *     summary: Get group members
 *     tags: [Groups]
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
 *         description: List of group members
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get('/groups/:groupId/members', getGroupMembers);

export default router;
