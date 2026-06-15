import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await sql`
      INSERT INTO users (email, password, name, free_credits)
      VALUES (${email}, ${hashedPassword}, ${name || email.split('@')[0]}, 3)
      RETURNING id, email, name, free_credits
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('用户已存在或创建失败');
  }
}

export async function validateUser(email: string, password: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      freeCredits: user.free_credits,
      image: user.image
    };
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT id, email, name, free_credits, image FROM users WHERE email = ${email}
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      freeCredits: result.rows[0].free_credits,
      image: result.rows[0].image
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function decrementFreeCredits(userId: number) {
  try {
    const result = await sql`
      UPDATE users 
      SET free_credits = free_credits - 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId} AND free_credits > 0
      RETURNING free_credits
    `;
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].free_credits;
  } catch (error) {
    console.error('Error decrementing credits:', error);
    return null;
  }
}
