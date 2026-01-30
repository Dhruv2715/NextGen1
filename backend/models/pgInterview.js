const { query } = require('../config/pgDb');

// Interview model for PostgreSQL
const Interview = {
  // Find interview by ID
  async findById(id) {
    const result = await query(
      `SELECT i.*, j.title as job_title, j.description as job_description,
       c.name as candidate_name, c.email as candidate_email,
       int.name as interviewer_name, int.email as interviewer_email
       FROM interviews i
       LEFT JOIN jobs j ON i.job_id = j.id
       LEFT JOIN users c ON i.candidate_id = c.id
       LEFT JOIN users int ON j.interviewer_id = int.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Find all interviews
  async findAll() {
    const result = await query(
      `SELECT i.*, j.title as job_title, 
       c.name as candidate_name, c.email as candidate_email,
       int.name as interviewer_name
       FROM interviews i
       LEFT JOIN jobs j ON i.job_id = j.id
       LEFT JOIN users c ON i.candidate_id = c.id
       LEFT JOIN users int ON j.interviewer_id = int.id
       ORDER BY i.created_at DESC`
    );
    return result.rows;
  },

  // Find interviews by candidate ID
  async findByCandidateId(candidateId) {
    const result = await query(
      `SELECT i.*, j.title as job_title, j.description as job_description,
       int.name as interviewer_name
       FROM interviews i
       LEFT JOIN jobs j ON i.job_id = j.id
       LEFT JOIN users int ON j.interviewer_id = int.id
       WHERE i.candidate_id = $1 
       ORDER BY i.created_at DESC`,
      [candidateId]
    );
    return result.rows;
  },

  // Find interviews by job ID
  async findByJobId(jobId) {
    const result = await query(
      `SELECT i.*, c.name as candidate_name, c.email as candidate_email
       FROM interviews i
       LEFT JOIN users c ON i.candidate_id = c.id
       WHERE i.job_id = $1 
       ORDER BY i.created_at DESC`,
      [jobId]
    );
    return result.rows;
  },

  // Find interviews by interviewer ID (through jobs)
  async findByInterviewerId(interviewerId) {
    const result = await query(
      `SELECT i.*, j.title as job_title, 
       c.name as candidate_name, c.email as candidate_email
       FROM interviews i
       LEFT JOIN jobs j ON i.job_id = j.id
       LEFT JOIN users c ON i.candidate_id = c.id
       WHERE j.interviewer_id = $1 
       ORDER BY i.created_at DESC`,
      [interviewerId]
    );
    return result.rows;
  },

  // Create new interview
  async create(interviewData) {
    const { job_id, candidate_id, status = 'scheduled' } = interviewData;
    const result = await query(
      `INSERT INTO interviews (job_id, candidate_id, status) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [job_id, candidate_id, status]
    );
    return result.rows[0];
  },

  // Update interview
  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbKey = key === 'feedback_json' ? 'feedback_json' : 
                     key === 'code_submission' ? 'code_submission' :
                     key === 'job_id' ? 'job_id' :
                     key === 'candidate_id' ? 'candidate_id' : key;
        fields.push(`${dbKey} = $${paramIndex}`);
        values.push(updateData[key]);
        paramIndex++;
      }
    });

    // If status is being updated to 'completed', set completed_at
    if (updateData.status === 'completed') {
      fields.push('completed_at = CURRENT_TIMESTAMP');
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE interviews SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete interview
  async delete(id) {
    const result = await query('DELETE FROM interviews WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },
};

module.exports = Interview;
