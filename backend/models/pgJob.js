const { query } = require('../config/pgDb');

// Job model for PostgreSQL
const Job = {
  // Find job by ID
  async findById(id) {
    const result = await query(
      `SELECT j.*, u.name as interviewer_name, u.email as interviewer_email 
       FROM jobs j 
       LEFT JOIN users u ON j.interviewer_id = u.id 
       WHERE j.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Find all jobs
  async findAll() {
    const result = await query(
      `SELECT j.*, u.name as interviewer_name, u.email as interviewer_email 
       FROM jobs j 
       LEFT JOIN users u ON j.interviewer_id = u.id 
       ORDER BY j.created_at DESC`
    );
    return result.rows;
  },

  // Find jobs by interviewer ID
  async findByInterviewerId(interviewerId) {
    const result = await query(
      `SELECT j.*, u.name as interviewer_name, u.email as interviewer_email 
       FROM jobs j 
       LEFT JOIN users u ON j.interviewer_id = u.id 
       WHERE j.interviewer_id = $1 
       ORDER BY j.created_at DESC`,
      [interviewerId]
    );
    return result.rows;
  },

  // Create new job
  async create(jobData) {
    const { title, description, required_skills, interviewer_id } = jobData;
    const result = await query(
      `INSERT INTO jobs (title, description, required_skills, interviewer_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [title, description, required_skills || [], interviewer_id]
    );
    return result.rows[0];
  },

  // Update job
  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbKey = key === 'interviewer_id' ? 'interviewer_id' : key;
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
      `UPDATE jobs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete job
  async delete(id) {
    const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },
};

module.exports = Job;
