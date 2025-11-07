const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./.env" });

// Import models
const Permission = require("./models/Permission");
const Role = require("./models/Role");
const Department = require("./models/Department");
const Section = require("./models/Section");
const Program = require("./models/Program");
const User = require("./models/User");
const Lead = require("./models/Lead");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    console.log("🗑️  Clearing existing data...");
    await Lead.deleteMany({});
    await User.deleteMany({});
    await Program.deleteMany({});
    await Section.deleteMany({});
    await Department.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});
    console.log("✅ Existing data cleared");
  } catch (error) {
    console.error("❌ Error clearing data:", error.message);
  }
};

// Seed Permissions
const seedPermissions = async () => {
  try {
    console.log("🔐 Seeding permissions...");

    const permissions = [
      // User permissions
      {
        name: "Create Users",
        description: "Create new users",
        resource: "users",
        action: "create",
      },
      {
        name: "Read Users",
        description: "View user information",
        resource: "users",
        action: "read",
      },
      {
        name: "Update Users",
        description: "Edit user information",
        resource: "users",
        action: "update",
      },
      {
        name: "Delete Users",
        description: "Delete users",
        resource: "users",
        action: "delete",
      },
      {
        name: "Manage Users",
        description: "Full user management",
        resource: "users",
        action: "manage",
      },

      // Lead permissions
      {
        name: "Create Leads",
        description: "Create new leads",
        resource: "leads",
        action: "create",
      },
      {
        name: "Read Leads",
        description: "View lead information",
        resource: "leads",
        action: "read",
      },
      {
        name: "Update Leads",
        description: "Edit lead information",
        resource: "leads",
        action: "update",
      },
      {
        name: "Delete Leads",
        description: "Delete leads",
        resource: "leads",
        action: "delete",
      },
      {
        name: "Manage Leads",
        description: "Full lead management",
        resource: "leads",
        action: "manage",
      },

      // Department permissions
      {
        name: "Create Departments",
        description: "Create new departments",
        resource: "departments",
        action: "create",
      },
      {
        name: "Read Departments",
        description: "View department information",
        resource: "departments",
        action: "read",
      },
      {
        name: "Update Departments",
        description: "Edit department information",
        resource: "departments",
        action: "update",
      },
      {
        name: "Delete Departments",
        description: "Delete departments",
        resource: "departments",
        action: "delete",
      },
      {
        name: "Manage Departments",
        description: "Full department management",
        resource: "departments",
        action: "manage",
      },

      // Section permissions
      {
        name: "Create Sections",
        description: "Create new sections",
        resource: "sections",
        action: "create",
      },
      {
        name: "Read Sections",
        description: "View section information",
        resource: "sections",
        action: "read",
      },
      {
        name: "Update Sections",
        description: "Edit section information",
        resource: "sections",
        action: "update",
      },
      {
        name: "Delete Sections",
        description: "Delete sections",
        resource: "sections",
        action: "delete",
      },
      {
        name: "Manage Sections",
        description: "Full section management",
        resource: "sections",
        action: "manage",
      },

      // Program permissions
      {
        name: "Create Programs",
        description: "Create new programs",
        resource: "programs",
        action: "create",
      },
      {
        name: "Read Programs",
        description: "View program information",
        resource: "programs",
        action: "read",
      },
      {
        name: "Update Programs",
        description: "Edit program information",
        resource: "programs",
        action: "update",
      },
      {
        name: "Delete Programs",
        description: "Delete programs",
        resource: "programs",
        action: "delete",
      },
      {
        name: "Manage Programs",
        description: "Full program management",
        resource: "programs",
        action: "manage",
      },

      // Role permissions
      {
        name: "Create Roles",
        description: "Create new roles",
        resource: "roles",
        action: "create",
      },
      {
        name: "Read Roles",
        description: "View role information",
        resource: "roles",
        action: "read",
      },
      {
        name: "Update Roles",
        description: "Edit role information",
        resource: "roles",
        action: "update",
      },
      {
        name: "Delete Roles",
        description: "Delete roles",
        resource: "roles",
        action: "delete",
      },
      {
        name: "Manage Roles",
        description: "Full role management",
        resource: "roles",
        action: "manage",
      },

      // Permission permissions
      {
        name: "Create Permissions",
        description: "Create new permissions",
        resource: "permissions",
        action: "create",
      },
      {
        name: "Read Permissions",
        description: "View permission information",
        resource: "permissions",
        action: "read",
      },
      {
        name: "Update Permissions",
        description: "Edit permission information",
        resource: "permissions",
        action: "update",
      },
      {
        name: "Delete Permissions",
        description: "Delete permissions",
        resource: "permissions",
        action: "delete",
      },
      {
        name: "Manage Permissions",
        description: "Full permission management",
        resource: "permissions",
        action: "manage",
      },

      // Inbox permissions
      {
        name: "Read Inbox",
        description: "View inbox messages",
        resource: "inbox",
        action: "read",
      },
      {
        name: "Manage Inbox",
        description: "Full inbox management",
        resource: "inbox",
        action: "manage",
      },
    ];

    const createdPermissions = await Permission.insertMany(permissions);
    console.log(`✅ Created ${createdPermissions.length} permissions`);
    return createdPermissions;
  } catch (error) {
    console.error("❌ Error seeding permissions:", error.message);
    throw error;
  }
};

// Seed Roles
const seedRoles = async (permissions) => {
  try {
    console.log("👥 Seeding roles...");

    // Get permission IDs by resource and action
    const getPermissionIds = (resource, actions) => {
      return permissions
        .filter((p) => p.resource === resource && actions.includes(p.action))
        .map((p) => p._id);
    };

    const roles = [
      {
        name: "Super Admin",
        description: "Full system access with all permissions",
        permissions: permissions.map((p) => p._id), // All permissions
      },
      {
        name: "Admin",
        description: "Administrative access with most permissions",
        permissions: [
          ...getPermissionIds("users", ["read", "update"]),
          ...getPermissionIds("leads", ["create", "read", "update", "delete"]),
          ...getPermissionIds("departments", ["read", "update"]),
          ...getPermissionIds("sections", ["read", "update"]),
          ...getPermissionIds("programs", ["read", "update"]),
          ...getPermissionIds("roles", ["read"]),
          ...getPermissionIds("permissions", ["read"]),
          ...getPermissionIds("inbox", ["read", "manage"]),
        ],
      },
      {
        name: "Manager",
        description: "Department manager with team management capabilities",
        permissions: [
          ...getPermissionIds("users", ["read"]),
          ...getPermissionIds("leads", ["create", "read", "update"]),
          ...getPermissionIds("departments", ["read"]),
          ...getPermissionIds("sections", ["read"]),
          ...getPermissionIds("programs", ["read"]),
          ...getPermissionIds("inbox", ["read", "manage"]),
        ],
      },
      {
        name: "Sales Representative",
        description: "Sales team member with lead management capabilities",
        permissions: [
          ...getPermissionIds("leads", ["create", "read", "update"]),
          ...getPermissionIds("departments", ["read"]),
          ...getPermissionIds("sections", ["read"]),
          ...getPermissionIds("programs", ["read"]),
          ...getPermissionIds("inbox", ["read"]),
        ],
      },
      {
        name: "Marketing Specialist",
        description: "Marketing team member with lead creation capabilities",
        permissions: [
          ...getPermissionIds("leads", ["create", "read", "update"]),
          ...getPermissionIds("departments", ["read"]),
          ...getPermissionIds("sections", ["read"]),
          ...getPermissionIds("programs", ["read"]),
          ...getPermissionIds("inbox", ["read"]),
        ],
      },
      {
        name: "Viewer",
        description: "Read-only access to view information",
        permissions: [
          ...getPermissionIds("leads", ["create", "read", "update"]),
          ...getPermissionIds("departments", ["read"]),
          ...getPermissionIds("sections", ["read"]),
          ...getPermissionIds("programs", ["read"]),
          ...getPermissionIds("inbox", ["read"]),
        ],
      },
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log(`✅ Created ${createdRoles.length} roles`);
    return createdRoles;
  } catch (error) {
    console.error("❌ Error seeding roles:", error.message);
    throw error;
  }
};

// Seed Departments
const seedDepartments = async () => {
  try {
    console.log("🏢 Seeding departments...");

    const departments = [
      {
        name: "Sales",
        description:
          "Sales department responsible for lead conversion and revenue generation",
      },
      {
        name: "Marketing",
        description:
          "Marketing department responsible for lead generation and brand promotion",
      },
      {
        name: "Customer Success",
        description:
          "Customer success department responsible for client satisfaction and retention",
      },
      {
        name: "Business Development",
        description:
          "Business development department responsible for strategic partnerships and growth",
      },
      {
        name: "Operations",
        description:
          "Operations department responsible for internal processes and efficiency",
      },
      {
        name: "Human Resources",
        description:
          "Human resources department responsible for talent management and employee relations",
      },
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);
    return createdDepartments;
  } catch (error) {
    console.error("❌ Error seeding departments:", error.message);
    throw error;
  }
};

// Seed Sections
const seedSections = async (departments) => {
  try {
    console.log("📁 Seeding sections...");

    const salesDept = departments.find((d) => d.name === "Sales");
    const marketingDept = departments.find((d) => d.name === "Marketing");
    const customerSuccessDept = departments.find(
      (d) => d.name === "Customer Success"
    );
    const businessDevDept = departments.find(
      (d) => d.name === "Business Development"
    );
    const operationsDept = departments.find((d) => d.name === "Operations");
    const hrDept = departments.find((d) => d.name === "Human Resources");

    const sections = [
      // Sales sections
      {
        name: "Enterprise Sales",
        description: "Large enterprise client sales",
        departmentId: salesDept._id,
      },
      {
        name: "SMB Sales",
        description: "Small and medium business sales",
        departmentId: salesDept._id,
      },
      {
        name: "Inside Sales",
        description: "Inside sales team",
        departmentId: salesDept._id,
      },

      // Marketing sections
      {
        name: "Digital Marketing",
        description: "Online marketing and advertising",
        departmentId: marketingDept._id,
      },
      {
        name: "Content Marketing",
        description: "Content creation and strategy",
        departmentId: marketingDept._id,
      },
      {
        name: "Event Marketing",
        description: "Event planning and management",
        departmentId: marketingDept._id,
      },

      // Customer Success sections
      {
        name: "Account Management",
        description: "Client account management",
        departmentId: customerSuccessDept._id,
      },
      {
        name: "Support",
        description: "Customer support and assistance",
        departmentId: customerSuccessDept._id,
      },

      // Business Development sections
      {
        name: "Partnerships",
        description: "Strategic partnerships and alliances",
        departmentId: businessDevDept._id,
      },
      {
        name: "Market Research",
        description: "Market analysis and research",
        departmentId: businessDevDept._id,
      },

      // Operations sections
      {
        name: "Process Improvement",
        description: "Process optimization and improvement",
        departmentId: operationsDept._id,
      },
      {
        name: "Quality Assurance",
        description: "Quality control and assurance",
        departmentId: operationsDept._id,
      },

      // HR sections
      {
        name: "Recruitment",
        description: "Talent acquisition and recruitment",
        departmentId: hrDept._id,
      },
      {
        name: "Employee Relations",
        description: "Employee relations and engagement",
        departmentId: hrDept._id,
      },
    ];

    const createdSections = await Section.insertMany(sections);
    console.log(`✅ Created ${createdSections.length} sections`);
    return createdSections;
  } catch (error) {
    console.error("❌ Error seeding sections:", error.message);
    throw error;
  }
};

// Seed Programs
const seedPrograms = async () => {
  try {
    console.log("📚 Seeding programs...");

    const programs = [
      {
        name: "Enterprise Software Solutions",
        description: "Comprehensive software solutions for large enterprises",
      },
      {
        name: "Cloud Migration Services",
        description: "Professional services for cloud infrastructure migration",
      },
      {
        name: "Digital Transformation",
        description: "End-to-end digital transformation consulting",
      },
      {
        name: "Data Analytics Platform",
        description:
          "Advanced data analytics and business intelligence solutions",
      },
      {
        name: "Cybersecurity Services",
        description: "Comprehensive cybersecurity and compliance solutions",
      },
      {
        name: "Mobile App Development",
        description: "Custom mobile application development services",
      },
      {
        name: "AI and Machine Learning",
        description: "Artificial intelligence and machine learning solutions",
      },
      {
        name: "E-commerce Solutions",
        description: "Complete e-commerce platform development and management",
      },
    ];

    const createdPrograms = await Program.insertMany(programs);
    console.log(`✅ Created ${createdPrograms.length} programs`);
    return createdPrograms;
  } catch (error) {
    console.error("❌ Error seeding programs:", error.message);
    throw error;
  }
};

// Seed Users
const seedUsers = async (roles, departments, sections) => {
  try {
    console.log("👤 Seeding users...");

    const superAdminRole = roles.find((r) => r.name === "Super Admin");
    const adminRole = roles.find((r) => r.name === "Admin");
    const managerRole = roles.find((r) => r.name === "Manager");
    const salesRepRole = roles.find((r) => r.name === "Sales Representative");
    const marketingRole = roles.find((r) => r.name === "Marketing Specialist");
    const viewerRole = roles.find((r) => r.name === "Viewer");

    const salesDept = departments.find((d) => d.name === "Sales");
    const marketingDept = departments.find((d) => d.name === "Marketing");
    const customerSuccessDept = departments.find(
      (d) => d.name === "Customer Success"
    );
    const businessDevDept = departments.find(
      (d) => d.name === "Business Development"
    );
    const operationsDept = departments.find((d) => d.name === "Operations");
    const hrDept = departments.find((d) => d.name === "Human Resources");

    const enterpriseSalesSection = sections.find(
      (s) => s.name === "Enterprise Sales"
    );
    const smbSalesSection = sections.find((s) => s.name === "SMB Sales");
    const digitalMarketingSection = sections.find(
      (s) => s.name === "Digital Marketing"
    );
    const accountManagementSection = sections.find(
      (s) => s.name === "Account Management"
    );

    const users = [
      {
        name: "John Smith",
        email: "john.smith@company.com",
        password: "password123",
        roleId: superAdminRole._id,
        departmentId: salesDept._id,
        sectionId: enterpriseSalesSection._id,
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        password: "password123",
        roleId: adminRole._id,
        departmentId: marketingDept._id,
        sectionId: digitalMarketingSection._id,
      },
      {
        name: "Mike Davis",
        email: "mike.davis@company.com",
        password: "password123",
        roleId: managerRole._id,
        departmentId: salesDept._id,
        sectionId: smbSalesSection._id,
      },
      {
        name: "Emily Wilson",
        email: "emily.wilson@company.com",
        password: "password123",
        roleId: salesRepRole._id,
        departmentId: salesDept._id,
        sectionId: enterpriseSalesSection._id,
      },
      {
        name: "David Brown",
        email: "david.brown@company.com",
        password: "password123",
        roleId: salesRepRole._id,
        departmentId: salesDept._id,
        sectionId: smbSalesSection._id,
      },
      {
        name: "Lisa Anderson",
        email: "lisa.anderson@company.com",
        password: "password123",
        roleId: marketingRole._id,
        departmentId: marketingDept._id,
        sectionId: digitalMarketingSection._id,
      },
      {
        name: "Robert Taylor",
        email: "robert.taylor@company.com",
        password: "password123",
        roleId: managerRole._id,
        departmentId: customerSuccessDept._id,
        sectionId: accountManagementSection._id,
      },
      {
        name: "Jennifer Martinez",
        email: "jennifer.martinez@company.com",
        password: "password123",
        roleId: viewerRole._id,
        departmentId: operationsDept._id,
      },
      {
        name: "Christopher Lee",
        email: "christopher.lee@company.com",
        password: "password123",
        roleId: salesRepRole._id,
        departmentId: businessDevDept._id,
      },
      {
        name: "Amanda Garcia",
        email: "amanda.garcia@company.com",
        password: "password123",
        roleId: marketingRole._id,
        departmentId: marketingDept._id,
        sectionId: digitalMarketingSection._id,
      },
    ];

    // Create users individually to trigger password hashing middleware
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    throw error;
  }
};

// Seed Leads
const seedLeads = async (users, departments, sections, programs) => {
  try {
    console.log("📋 Seeding leads...");

    const salesDept = departments.find((d) => d.name === "Sales");
    const marketingDept = departments.find((d) => d.name === "Marketing");
    const businessDevDept = departments.find(
      (d) => d.name === "Business Development"
    );

    const enterpriseSalesSection = sections.find(
      (s) => s.name === "Enterprise Sales"
    );
    const smbSalesSection = sections.find((s) => s.name === "SMB Sales");
    const digitalMarketingSection = sections.find(
      (s) => s.name === "Digital Marketing"
    );

    const enterpriseProgram = programs.find(
      (p) => p.name === "Enterprise Software Solutions"
    );
    const cloudProgram = programs.find(
      (p) => p.name === "Cloud Migration Services"
    );
    const digitalProgram = programs.find(
      (p) => p.name === "Digital Transformation"
    );
    const dataProgram = programs.find(
      (p) => p.name === "Data Analytics Platform"
    );

    const leads = [
      {
        title: "Enterprise CRM Implementation",
        description:
          "Large enterprise looking to implement a comprehensive CRM solution for their sales team.",
        status: "new",
        priority: "high",
        source: "Website Contact Form",
        contactInfo: {
          name: "Michael Thompson",
          email: "michael.thompson@techcorp.com",
          phone: "+1-555-0123",
          company: "TechCorp Industries",
        },
        assignedToId: users.find((u) => u.name === "Emily Wilson")._id,
        createdById: users.find((u) => u.name === "John Smith")._id,
        departmentId: salesDept._id,
        sectionId: enterpriseSalesSection._id,
        programId: enterpriseProgram._id,
        estimatedValue: 150000,
        expectedCloseDate: new Date("2024-12-31"),
        notes:
          "High priority lead with strong budget allocation. Decision maker is CTO.",
        tags: ["enterprise", "crm", "high-value"],
      },
      {
        title: "Cloud Infrastructure Migration",
        description:
          "Mid-size company needs assistance migrating their infrastructure to AWS.",
        status: "contacted",
        priority: "medium",
        source: "Referral",
        contactInfo: {
          name: "Sarah Chen",
          email: "sarah.chen@innovateco.com",
          phone: "+1-555-0456",
          company: "InnovateCo Solutions",
        },
        assignedToId: users.find((u) => u.name === "David Brown")._id,
        createdById: users.find((u) => u.name === "Mike Davis")._id,
        departmentId: salesDept._id,
        sectionId: smbSalesSection._id,
        programId: cloudProgram._id,
        estimatedValue: 75000,
        expectedCloseDate: new Date("2024-11-15"),
        notes:
          "Initial contact made. Technical requirements gathering in progress.",
        tags: ["cloud", "migration", "aws"],
      },
      {
        title: "Digital Marketing Campaign",
        description:
          "E-commerce company looking for comprehensive digital marketing services.",
        status: "qualified",
        priority: "medium",
        source: "LinkedIn",
        contactInfo: {
          name: "James Rodriguez",
          email: "james.rodriguez@shopmart.com",
          phone: "+1-555-0789",
          company: "ShopMart Online",
        },
        assignedToId: users.find((u) => u.name === "Lisa Anderson")._id,
        createdById: users.find((u) => u.name === "Sarah Johnson")._id,
        departmentId: marketingDept._id,
        sectionId: digitalMarketingSection._id,
        estimatedValue: 45000,
        expectedCloseDate: new Date("2024-10-30"),
        notes:
          "Qualified lead. Budget approved, waiting for contract signature.",
        tags: ["marketing", "ecommerce", "digital"],
      },
      {
        title: "Data Analytics Platform",
        description:
          "Financial services company needs advanced analytics platform for risk assessment.",
        status: "proposal",
        priority: "high",
        source: "Trade Show",
        contactInfo: {
          name: "Dr. Patricia Kim",
          email: "patricia.kim@financefirst.com",
          phone: "+1-555-0321",
          company: "FinanceFirst Bank",
        },
        assignedToId: users.find((u) => u.name === "Emily Wilson")._id,
        createdById: users.find((u) => u.name === "John Smith")._id,
        departmentId: salesDept._id,
        sectionId: enterpriseSalesSection._id,
        programId: dataProgram._id,
        estimatedValue: 200000,
        expectedCloseDate: new Date("2024-12-15"),
        notes: "Proposal submitted. Technical review scheduled for next week.",
        tags: ["analytics", "finance", "enterprise"],
      },
      {
        title: "Digital Transformation Initiative",
        description:
          "Manufacturing company seeking comprehensive digital transformation consulting.",
        status: "negotiation",
        priority: "urgent",
        source: "Cold Call",
        contactInfo: {
          name: "Robert Williams",
          email: "robert.williams@manufactureplus.com",
          phone: "+1-555-0654",
          company: "ManufacturePlus Corp",
        },
        assignedToId: users.find((u) => u.name === "Christopher Lee")._id,
        createdById: users.find((u) => u.name === "Mike Davis")._id,
        departmentId: businessDevDept._id,
        programId: digitalProgram._id,
        estimatedValue: 300000,
        expectedCloseDate: new Date("2024-11-30"),
        notes:
          "In final negotiation phase. Legal team reviewing contract terms.",
        tags: ["transformation", "manufacturing", "consulting"],
      },
      {
        title: "SMB Software Package",
        description: "Small business looking for integrated software solution.",
        status: "closed-won",
        priority: "low",
        source: "Website",
        contactInfo: {
          name: "Maria Gonzalez",
          email: "maria.gonzalez@smallbiz.com",
          phone: "+1-555-0987",
          company: "SmallBiz Solutions",
        },
        assignedToId: users.find((u) => u.name === "David Brown")._id,
        createdById: users.find((u) => u.name === "Mike Davis")._id,
        departmentId: salesDept._id,
        sectionId: smbSalesSection._id,
        programId: enterpriseProgram._id,
        estimatedValue: 25000,
        expectedCloseDate: new Date("2024-09-15"),
        actualCloseDate: new Date("2024-09-10"),
        notes: "Successfully closed! Implementation started.",
        tags: ["smb", "software", "closed-won"],
      },
      {
        title: "Marketing Automation Platform",
        description:
          "Marketing agency needs automation platform for client management.",
        status: "closed-lost",
        priority: "medium",
        source: "Email Campaign",
        contactInfo: {
          name: "Alex Turner",
          email: "alex.turner@marketingpro.com",
          phone: "+1-555-0147",
          company: "MarketingPro Agency",
        },
        assignedToId: users.find((u) => u.name === "Amanda Garcia")._id,
        createdById: users.find((u) => u.name === "Sarah Johnson")._id,
        departmentId: marketingDept._id,
        sectionId: digitalMarketingSection._id,
        estimatedValue: 35000,
        expectedCloseDate: new Date("2024-08-30"),
        actualCloseDate: new Date("2024-08-25"),
        notes: "Lost to competitor due to pricing. Follow up in 6 months.",
        tags: ["marketing", "automation", "closed-lost"],
      },
    ];

    const createdLeads = await Lead.insertMany(leads);
    console.log(`✅ Created ${createdLeads.length} leads`);
    return createdLeads;
  } catch (error) {
    console.error("❌ Error seeding leads:", error.message);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    await connectDB();
    await clearData();

    const permissions = await seedPermissions();
    const roles = await seedRoles(permissions);
    const departments = await seedDepartments();
    const sections = await seedSections(departments);
    const programs = await seedPrograms();
    const users = await seedUsers(roles, departments, sections);
    const leads = await seedLeads(users, departments, sections, programs);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • ${permissions.length} permissions created`);
    console.log(`   • ${roles.length} roles created`);
    console.log(`   • ${departments.length} departments created`);
    console.log(`   • ${sections.length} sections created`);
    console.log(`   • ${programs.length} programs created`);
    console.log(`   • ${users.length} users created`);
    console.log(`   • ${leads.length} leads created`);

    console.log("\n🔑 Default Login Credentials:");
    console.log("   Super Admin: john.smith@company.com / password123");
    console.log("   Admin: sarah.johnson@company.com / password123");
    console.log("   Manager: mike.davis@company.com / password123");
    console.log("   Sales Rep: emily.wilson@company.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
