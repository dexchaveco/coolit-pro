// Seeds a starter dataset for Cool It With Rick. Safe to re-run; it only
// inserts a user/customer when one with that email/name doesn't exist yet.
// Run with: npm run seed

import { getDb, run, one } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

async function upsertUser(name: string, email: string, password: string, role: "OWNER" | "TECH", color: string) {
  const existing = one<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) {
    console.log(`- user already exists: ${email}`);
    return existing.id;
  }
  const hash = await hashPassword(password);
  const result = run(
    "INSERT INTO users (name, email, password_hash, role, color) VALUES (?, ?, ?, ?, ?)",
    [name, email, hash, role, color]
  );
  console.log(`- created user: ${name} <${email}> (temp password: ${password})`);
  return Number(result.lastInsertRowid);
}

function upsertCustomer(name: string, phone: string, address: string, city: string) {
  const existing = one<{ id: number }>("SELECT id FROM customers WHERE name = ?", [name]);
  if (existing) return existing.id;
  const result = run(
    "INSERT INTO customers (name, phone, address, city, state) VALUES (?, ?, ?, ?, 'FL')",
    [name, phone, address, city]
  );
  return Number(result.lastInsertRowid);
}

async function main() {
  getDb(); // ensures schema is applied

  console.log("Seeding Coolit Pro...\n");

  const dexterId = await upsertUser("Dexter Chaveco", "dexchaveco@gmail.com", "coolit2026", "OWNER", "#2a78d6");
  const rickId = await upsertUser("Rick", "rick@coolitwithrick.com", "coolit2026", "TECH", "#eb6834");

  const customer1 = upsertCustomer("Maria Alvarez", "3055550142", "1420 SW 12th St", "Miami");
  const customer2 = upsertCustomer("DEJO LLC (Pinecrest duct job)", "7865550199", "7185 SW 101 St", "Pinecrest");
  const customer3 = upsertCustomer("Russo Properties", "2395550188", "Cape Coral 10-plex", "Cape Coral");

  // A couple of open leads sitting in intake, so the board isn't empty on first login
  const leadExists = one("SELECT id FROM leads LIMIT 1");
  if (!leadExists) {
    run(
      `INSERT INTO leads (customer_name, phone, issue_description, source, status, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Janet Kirby", "3055550110", "AC blowing warm air, wants someone out this week", "phone", "NEW", dexterId]
    );
    run(
      `INSERT INTO leads (customer_name, phone, issue_description, source, status, assigned_to, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ["Tom Bristow", "3055550177", "Annual maintenance visit for a rental unit", "text", "CONTACTED", rickId, dexterId]
    );
    console.log("- seeded 2 starter leads in Intake");
  }

  const jobExists = one("SELECT id FROM jobs LIMIT 1");
  if (!jobExists) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const scheduled = tomorrow.toISOString().slice(0, 16);
    run(
      `INSERT INTO jobs (customer_id, title, description, job_type, status, address, scheduled_at, assigned_to, created_by)
       VALUES (?, ?, ?, ?, 'SCHEDULED', ?, ?, ?, ?)`,
      [customer1, "AC not cooling — diagnose and repair", "Customer reports warm air from vents", "service", "1420 SW 12th St, Miami", scheduled, rickId, dexterId]
    );
    console.log("- seeded 1 starter job");
  }

  const planExists = one("SELECT id FROM maintenance_plans LIMIT 1");
  if (!planExists) {
    const nextDue = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    run(
      `INSERT INTO maintenance_plans (customer_id, plan_name, monthly_price_cents, visits_per_year, next_visit_due) VALUES (?, 'Cool It Care Plan', 2900, 1, ?)`,
      [customer1, nextDue]
    );
    run(`UPDATE customers SET on_maintenance_plan = 1 WHERE id = ?`, [customer1]);
    console.log("- seeded 1 maintenance plan");
  }

  void customer2;
  void customer3;

  console.log("\nDone. Log in at /login with the emails above.");
  console.log("IMPORTANT: change these temporary passwords right after your first login (Settings page).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
