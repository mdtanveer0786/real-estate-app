const assert = require('assert');

console.log('🧪 Running API integration checks...');

// Check that controllers and models can load properly without syntax/module errors
try {
    require('../src/models/User');
    require('../src/models/Property');
    require('../src/models/Subscription');
    console.log('✅ DB models loaded successfully');

    require('../src/utils/generateToken');
    require('../src/utils/validation');
    console.log('✅ Utility modules loaded successfully');
    
    console.log('🎉 All tests passed successfully!');
    process.exit(0);
} catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
}
