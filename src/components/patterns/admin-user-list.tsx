"use client";

import * as React from "react";
import Link from "next/link";
import { Baby, GraduationCap, ShieldAlert, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { useAdminUserRows, type AdminUserRole } from "@/lib/accounts/admin-user-rows";
import { filterAdminUsers, type AdminUserFilters } from "@/lib/accounts/admin-user-filters";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_STATUSES, type AccountStatus } from "@/lib/accounts/types";

const ROLE_LABELS: Record<AdminUserRole, string> = {
  teacher: "Teacher",
  child: "Child",
};

const ROLE_ICONS: Record<AdminUserRole, typeof GraduationCap> = {
  teacher: GraduationCap,
  child: Baby,
};

/**
 * The unified admin user list Prompt 57 asks for — see
 * docs/ADMIN_ARCHITECTURE.md for the full reasoning behind every
 * decision here, especially why "Parent" and "Administrator" aren't
 * listed as rows (neither has a persisted account record anywhere in
 * this codebase; inventing one would be fake user data) and why child
 * rows deliberately show almost nothing (name, age, account status —
 * never progress, activity, or anything beyond what's needed to manage
 * the account).
 */
function AdminUserList() {
  const { rows, ready } = useAdminUserRows();
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState<AdminUserRole | "">("");
  const [accountStatus, setAccountStatus] = React.useState<AccountStatus | "">("");

  const filters: AdminUserFilters = {
    query: query || undefined,
    role: role || undefined,
    accountStatus: accountStatus || undefined,
  };
  const hasActiveFilters = Boolean(query || role || accountStatus);
  const filtered = filterAdminUsers(rows, filters);

  function clearFilters() {
    setQuery("");
    setRole("");
    setAccountStatus("");
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: "Users" }]}
        eyebrow="Admin"
        title="User management"
        description="Every real account this device holds, in one searchable list."
        surface="tint-secondary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-4xl">
          <Alert variant="info" className="mb-8">
            There&apos;s no shared backend yet, so this list can only ever show accounts saved on{" "}
            <strong>this device</strong>. Parent and Administrator accounts aren&apos;t stored anywhere in this
            codebase — only Teacher and Child profiles are real, persisted records — so they aren&apos;t listed as
            rows here. See docs/ADMIN_ARCHITECTURE.md.
          </Alert>

          <div className="grid gap-4 rounded-xl border border-neutral-200 bg-surface p-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="admin-user-q">Search</Label>
              <Input
                id="admin-user-q"
                type="search"
                placeholder="Name, email…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="admin-user-role">Role</Label>
              <Select id="admin-user-role" value={role} onChange={(e) => setRole(e.target.value as AdminUserRole | "")}>
                <option value="">Any role</option>
                <option value="teacher">Teacher</option>
                <option value="child">Child</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-user-status">Account status</Label>
              <Select
                id="admin-user-status"
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value as AccountStatus | "")}
              >
                <option value="">Any status</option>
                {ACCOUNT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {ACCOUNT_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </div>
            {hasActiveFilters && (
              <div className="flex items-end sm:col-span-3">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8">
            {!ready ? null : filtered.length === 0 ? (
              <EmptyState
                icon={hasActiveFilters ? Users : GraduationCap}
                title={hasActiveFilters ? "No users match your filters" : "No accounts on this device yet"}
                description={
                  hasActiveFilters
                    ? "Try clearing a filter."
                    : "A teacher account is created via /teachers/register, a child profile via the parent dashboard — nothing here is invented in the meantime."
                }
                action={
                  hasActiveFilters ? (
                    <Button size="sm" variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-surface-sunken text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Account status</th>
                      <th className="px-4 py-3 font-medium">Registered</th>
                      <th className="px-4 py-3 font-medium">Details</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filtered.map((row) => {
                      const RoleIcon = ROLE_ICONS[row.role];
                      return (
                        <tr key={`${row.role}-${row.id}`}>
                          <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-neutral-700">
                              <RoleIcon className="size-3.5" aria-hidden="true" />
                              {ROLE_LABELS[row.role]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={row.accountStatus === "active" ? "success" : "error"}>
                              {ACCOUNT_STATUS_LABELS[row.accountStatus]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-neutral-500">
                            {new Date(row.registeredAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">{row.summary}</td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={row.detailHref}>
                                <ShieldAlert aria-hidden="true" />
                                {row.role === "teacher" ? "Review" : "Manage"}
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}

export { AdminUserList };
