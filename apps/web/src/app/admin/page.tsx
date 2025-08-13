export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage featured nuggets, feature visibility, and prompts
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Featured Nuggets</h3>
          <p className="text-sm text-muted-foreground">Schedule daily features</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Feature Visibility</h3>
          <p className="text-sm text-muted-foreground">Control free/paid access</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Prompts</h3>
          <p className="text-sm text-muted-foreground">Edit AI agent prompts</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Users</h3>
          <p className="text-sm text-muted-foreground">Manage admin users</p>
        </div>
      </div>
    </div>
  );
}