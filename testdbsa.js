const pool = require("./db_sa");

async function testConnection() {
    try {
        const result = await pool.query("SELECT current_database()");
        console.log(result.rows);
    } catch (error) {
        console.error("Database connection failed:", error.message)

    } finally {
        await pool.end();
    }
}

testConnection();