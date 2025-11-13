const mongoose = require('mongoose');
const LuWafaq = require('../models/LuWafaq');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leadsdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const wafaqs = [
  {
    wafaq_name: 'Wafaq-ul-Madaris Al-Arabia Pakistan',
    school_of_thought: 'Barelvi',
    hq_address: 'Multan, Punjab, Pakistan',
    contact: '+92-61-9210071',
    email: 'info@wafaq.org',
    website: 'www.wafaq.org',
    estd_year: 1959,
    chairman_name: 'Mufti Muneeb-ur-Rehman',
    registration_no: 'RP/II-4/59/1959',
    status: true
  },
  {
    wafaq_name: 'Wafaq-ul-Madaris Al-Salfia',
    school_of_thought: 'Ahl-e-Hadith',
    hq_address: 'Faisalabad, Punjab, Pakistan',
    contact: '+92-41-8500085',
    email: 'info@wafaqsalafiya.org',
    website: 'www.wafaqsalafiya.org',
    estd_year: 1955,
    chairman_name: 'Maulana Zubair Ahmed Zaheer',
    registration_no: 'RP/II-4/55/1955',
    status: true
  },
  {
    wafaq_name: 'Wafaq-ul-Madaris Al-Shia',
    school_of_thought: 'Shia',
    hq_address: 'Lahore, Punjab, Pakistan',
    contact: '+92-42-37351001',
    email: 'info@wafaqshia.org',
    website: 'www.wafaqshia.org',
    estd_year: 1959,
    chairman_name: 'Allama Syed Sajid Ali Naqvi',
    registration_no: 'RP/II-4/59/1959',
    status: true
  },
  {
    wafaq_name: 'Wafaq-ul-Madaris Al-Islamia',
    school_of_thought: 'Deobandi',
    hq_address: 'Lahore, Punjab, Pakistan',
    contact: '+92-42-37220777',
    email: 'info@wafaqislamia.org',
    website: 'www.wafaqislamia.org',
    estd_year: 1959,
    chairman_name: 'Maulana Hanif Jalandhari',
    registration_no: 'RP/II-4/59/1959',
    status: true
  },
  {
    wafaq_name: 'Rabita-ul-Madaris Al-Islamia',
    school_of_thought: 'Jamaat-e-Islami',
    hq_address: 'Mansoora, Lahore, Pakistan',
    contact: '+92-42-35439100',
    email: 'info@rabita.org.pk',
    website: 'www.rabita.org.pk',
    estd_year: 1983,
    chairman_name: 'Siraj-ul-Haq',
    registration_no: 'RP/II-4/83/1983',
    status: true
  }
];

// Up migration
const up = async () => {
  try {
    await connectDB();
    
    // Check if the collection already exists
    const collections = await mongoose.connection.db.listCollections({ name: 'lu_wafaqs' }).toArray();
    if (collections.length > 0) {
      console.log('LuWafaq collection already exists. Skipping creation.');
      return;
    }
    
    // Create collection and insert data
    await LuWafaq.createCollection();
    await LuWafaq.insertMany(wafaqs);
    
    console.log('LuWafaq collection created successfully with initial data');
  } catch (error) {
    console.error('Error creating LuWafaq collection:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

// Down migration
const down = async () => {
  try {
    await connectDB();
    
    // Drop the collection
    await mongoose.connection.db.dropCollection('lu_wafaqs');
    console.log('LuWafaq collection dropped successfully');
  } catch (error) {
    console.error('Error dropping LuWafaq collection:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

// Execute if run directly from command line
if (require.main === module) {
  (async () => {
    try {
      if (process.argv[2] === '--down') {
        await down();
      } else {
        await up();
      }
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = { up, down };
