const nodemailer = require('nodemailer');
const db = require('../db');

// Mock dependencies before requiring module
jest.mock('nodemailer');
jest.mock('../db');

// Setup mock data and functions
const mockSendMail = jest.fn().mockResolvedValue({ response: 'OK' });
const mockTransporter = { sendMail: mockSendMail };

// Setup nodemailer mock
nodemailer.createTransport.mockReturnValue(mockTransporter);

// Now require the module with mocks in place
const { sendMedicineReminders } = require('../SendMedicineReminders');

describe('SendMedicineReminders', () => {
  let realDate;
  let originalConsoleLog;
  let originalConsoleError;
  
  beforeAll(() => {
    // Mock console methods to avoid noise during tests
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Save original Date
    realDate = global.Date;
  });
  
  afterAll(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    // Restore original Date
    global.Date = realDate;
  });
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set fixed date for testing - 2021-05-03T12:00:00Z
    const fixedDate = new Date(1620043200000);
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return fixedDate;
        }
        return new realDate(...args);
      }
      static now() {
        return fixedDate.getTime();
      }
    };
    
    // Ensure our fixed date has the getTime method
    Date.prototype.getTime = function() {
      if (this === fixedDate) {
        return 1620043200000;
      }
      return realDate.prototype.getTime.call(this);
    };
  });
  
  it('should send reminders for medicines scheduled today', async () => {
    // Mock reminders data
    const mockReminders = [
      {
        reminderId: 1,
        reminderDate: '2021-05-03',
        reminderTime: '12:00:00', // Same time as mock date
        minutesBefore: 0,
        userId: 1,
        userEmail: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        medicineName: 'Aspirin'
      }
    ];
    
    // Mock database query results correctly
    // First result is the list of reminders
    // Second result is the update confirmation
    db.query.mockResolvedValueOnce([mockReminders])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    await sendMedicineReminders();
    
    // Check if email was sent
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail.mock.calls[0][0]).toMatchObject({
      to: 'user@example.com',
      subject: '📬 Vaistų priminimas'
    });
    
    // Check if reminder was marked as sent
    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[1][0]).toContain('UPDATE reminders');
    expect(db.query.mock.calls[1][1]).toEqual([1]);
  });
  
  it('should not send reminders if scheduled time is in the future', async () => {
    // Mock reminders with future time
    const mockReminders = [
      {
        reminderId: 2,
        reminderDate: '2021-05-03',
        reminderTime: '23:59:59', // Future time
        minutesBefore: 30,
        userId: 1,
        userEmail: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        medicineName: 'Ibuprofen'
      }
    ];
    
    // Return properly formatted response
    db.query.mockResolvedValueOnce([mockReminders]);
    
    await sendMedicineReminders();
    
    // No email should be sent
    expect(mockSendMail).not.toHaveBeenCalled();
    
    // Only the first query to get reminders should be made
    expect(db.query).toHaveBeenCalledTimes(1);
  });
  
  it('should handle errors when sending email', async () => {
    // Mock reminders data
    const mockReminders = [
      {
        reminderId: 3,
        reminderDate: '2021-05-03',
        reminderTime: '12:00:00', // Same time as mock date
        minutesBefore: 0,
        userId: 1,
        userEmail: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        medicineName: 'Paracetamol'
      }
    ];
    
    // Mock database query result
    db.query.mockResolvedValueOnce([mockReminders]);
    
    // Mock email sending failure
    mockSendMail.mockRejectedValueOnce(new Error('Email sending failed'));
    
    await sendMedicineReminders();
    
    // Should try to send email but fail
    expect(mockSendMail).toHaveBeenCalledTimes(1);
    
    // Should log error
    expect(console.error).toHaveBeenCalled();
    
    // Should not update reminder as sent
    expect(db.query).toHaveBeenCalledTimes(1); // Only the first query to get reminders
  });
  
  it('should handle empty reminder results', async () => {
    // Mock empty reminders list
    db.query.mockResolvedValueOnce([[]]);
    
    await sendMedicineReminders();
    
    // No emails should be sent
    expect(mockSendMail).not.toHaveBeenCalled();
    
    // Only the query to get reminders should be made
    expect(db.query).toHaveBeenCalledTimes(1);
  });
}); 