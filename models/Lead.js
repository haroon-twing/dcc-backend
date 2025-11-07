const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lead title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Lead description is required"],
      trim: true,
    },
    docs: {
      type: String,
      trim: true,
    },
    documentFiles: [{
      filename: {
        type: String,
        trim: true,
      },
      originalName: {
        type: String,
        trim: true,
      },
      mimetype: {
        type: String,
        trim: true,
      },
      size: {
        type: Number,
      },
      path: {
        type: String,
        trim: true,
      },
    }],
    // Keep documentFile for backward compatibility
    documentFile: {
      filename: {
        type: String,
        trim: true,
      },
      originalName: {
        type: String,
        trim: true,
      },
      mimetype: {
        type: String,
        trim: true,
      },
      size: {
        type: Number,
      },
      path: {
        type: String,
        trim: true,
      },
    },
    response: {
      type: String,
      trim: true,
    },
    suggestedResponse: {
      type: String,
      trim: true,
    },
    responseInitiated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "closed-won",
        "closed-lost",
      ],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    source: {
      type: String,
      trim: true,
      maxlength: [100, "Source cannot exceed 100 characters"],
    },

    assignedToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        assignedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    estimatedValue: {
      type: Number,
      min: [0, "Estimated value cannot be negative"],
    },
    expectedCloseDate: {
      type: Date,
    },
    actualCloseDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
leadSchema.index({ title: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ assignedToId: 1 });
leadSchema.index({ "assignedUsers.userId": 1 });
leadSchema.index({ createdById: 1 });
leadSchema.index({ departmentId: 1 });
leadSchema.index({ sectionId: 1 });
leadSchema.index({ programId: 1 });
leadSchema.index({ "contactInfo.email": 1 });
leadSchema.index({ "readBy.userId": 1 });
leadSchema.index({ createdAt: -1 });

// Update timestamp on save
leadSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Lead", leadSchema);
