# Database TeachSpace (`teachspace_db`)

Skema database relasional MySQL 8.x untuk platform **TeachSpace** terdiri dari 18 tabel inti dengan isolasi multi-tenant berbasis `workspace_id`.

## Import Schema & Seed

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

## Akun Demo (dari `seed.sql`)

1. **Guru Sekolah**: `guru@teachspace.id` / `TeachSpace123!`
2. **Tutor Independen (Workspace Terpisah)**: `tutor@teachspace.id` / `TeachSpace123!`
