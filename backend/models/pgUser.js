const { query } = require('../config/pgDb');

// User model for PostgreSQL
const User = {
  // Find user by email
  async findByEmail(email) {
    const result = await query(
      'SELECT id, email, name, password, role, profile_image_url, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  // Find user by ID
  async findById(id) {
    const result = await query(
      'SELECT id, email, name, password, role, profile_image_url, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Create new user
  async create(userData) {
    const { name, email, password, role = 'candidate', profileImageUrl } = userData;
    const result = await query(
      `INSERT INTO users (name, email, password, role, profile_image_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name, role, profile_image_url, created_at, updated_at`,
      [name, email, password, role, profileImageUrl]
    );
    return result.rows[0];
  },

  // Update user
  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbKey = key === 'profileImageUrl' ? 'profile_image_url' : key;
        fields.push(`${dbKey} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} 
       RETURNING id, email, name, role, profile_image_url, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete user
  async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },

  // Get all users
  async findAll() {
    const result = await query(
      'SELECT id, email, name, role, profile_image_url, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  },
};

module.exports = User;
