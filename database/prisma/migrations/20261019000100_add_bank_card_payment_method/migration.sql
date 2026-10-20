INSERT INTO "payment_methods" (
    "id",
    "name",
    "is_active",
    "created_at",
    "updated_at"
)
VALUES (
    'e6cfa252-2bdd-4be8-9b3d-17c6c086db41',
    'Bank Card',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("name") DO UPDATE SET
    "is_active" = TRUE,
    "deleted_at" = NULL,
    "updated_at" = CURRENT_TIMESTAMP;
