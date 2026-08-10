import psycopg2

try:
    conn = psycopg2.connect("dbname=math_olympiad user=postgres password=postgres host=localhost port=5432")
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type VARCHAR DEFAULT 'PG' NOT NULL;")
    cursor.execute("ALTER TABLE questions ALTER COLUMN options DROP NOT NULL;")
    print("Migration successful.")
    cursor.close()
    conn.close()
except Exception as e:
    print("Migration failed:", e)
