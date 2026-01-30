const { query } = require('../config/pgDb');

// Transcript model for PostgreSQL
const Transcript = {
  // Find transcript by ID
  async findById(id) {
    const result = await query(
      'SELECT * FROM transcripts WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Find all transcripts for an interview
  async findByInterviewId(interviewId) {
    const result = await query(
      'SELECT * FROM transcripts WHERE interview_id = $1 ORDER BY timestamp ASC',
      [interviewId]
    );
    return result.rows;
  },

  // Create new transcript entry
  async create(transcriptData) {
    const { interview_id, text_content, timestamp } = transcriptData;
    const result = await query(
      `INSERT INTO transcripts (interview_id, text_content, timestamp) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [interview_id, text_content, timestamp || new Date()]
    );
    return result.rows[0];
  },

  // Create multiple transcript entries (for bulk insert)
  async createMany(transcripts) {
    if (transcripts.length === 0) return [];
    
    const values = [];
    const placeholders = [];
    let paramIndex = 1;

    transcripts.forEach((t, idx) => {
      placeholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
      values.push(t.interview_id, t.text_content, t.timestamp || new Date());
      paramIndex += 3;
    });

    const result = await query(
      `INSERT INTO transcripts (interview_id, text_content, timestamp) 
       VALUES ${placeholders.join(', ')} 
       RETURNING *`,
      values
    );
    return result.rows;
  },

  // Delete transcripts by interview ID
  async deleteByInterviewId(interviewId) {
    const result = await query(
      'DELETE FROM transcripts WHERE interview_id = $1 RETURNING id',
      [interviewId]
    );
    return result.rows;
  },
};

module.exports = Transcript;
