const express = require("express")

const app = express();

const pool = require("./db_sa");

app.use(express.json());

app.get("/notes", async function(req,res) {
    try {
        const result = await pool.query(
            "SELECT * FROM notes ORDER BY id ASC"
        );
        res.json(result.rows)

    } catch (error) {
        console.error(error.message)
        res.status(500).json({
            message: "no get notes"
        })

    }
});
app.post("/notes", async function (req, res) {
    const {title, content } = req.body ?? {};

    if (
        typeof title !== "string" ||
        typeof content !== "string" ||
        title.trim() === "" ||
        content.trim() === "" ||
        title.length > 200 
    ) {
        return res.status(400).json({
            message: "Title and content are required. Title must not exceed 200 characters."

        });

    }

    try {
        const result = await pool.query(
            "INSERT INTO notes (title, content) VALUES ($1, $2)  RETURNING *",
            [title, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error.message)

        res.status(500).json({
            message: "can not create note"
        });

    }
});

app.put("/notes/:id", async function (req, res) {
    const id = Number(req.params.id);
    const { title, content } = req.body ?? {};

    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
        return res.status(400).json({
            message: "Invalid note ID"
        });
    }

    if (
        typeof title !== "string" ||
        typeof content !== "string" ||
        title.trim() === "" ||
        content.trim() === "" ||
        title.length > 200
    ) {
        return res.status(400).json({
            message: "Title and content are required. Title must not exceed 200 characters."
        });
    }

    try {
        const result = await pool.query(
            "UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *",
            [title, content, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Could not update note"
        });
    }
});

app.delete("/notes/:id", async function(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <1 || id > 2147483647) {
        return res.status(400).json ({
            message: "Invalid note ID"
        });
    }

    try {
        const result = await pool.query(
            "DELETE FORM notes WHERE id = $1 RETURNING *",
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

    res.json({
        message: "Note deleted successfully",
        note: result.rows[0]
    });

} catch (error) {
    console.error(error.message);

    res.status(500).json({
        message: "could not delete note"
    });
}
});

app.listen(3000, function(){
    console.log("Server salar running at http://localhost:3000");
});


