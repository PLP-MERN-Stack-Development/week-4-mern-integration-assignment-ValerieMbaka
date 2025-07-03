const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            unique: true,
            trim: true,
            maxlength: [50, 'Category name cannot be more than 50 characters'],
        },
        slug: {
            type: String,
            unique: true,
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters'],
        },
        image: {
            type: String,
            default: 'default-category.jpg',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Create slug from name before saving
CategorySchema.pre('save', function (next) {
    if (!this.isModified('name')) {
        return next();
    }
  
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Virtual for category URL
CategorySchema.virtual('url').get(function () {
    return `/categories/${this.slug}`;
});

// Virtual to get posts in this category
CategorySchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'category',
    justOne: false,
});

module.exports = mongoose.model('Category', CategorySchema);