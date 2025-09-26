import { google } from 'googleapis';

export interface FormData {
  name: string;
  email: string;
  message: string;
  timestamp: Date;
  source?: string;
}

export class GoogleSheetsService {
  private sheets: any;
  private auth: any;

  constructor() {
    // Initialize with service account credentials
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SHEETS_KEY_FILE, // Path to service account key file
      scopes: ['https://www.googleapis.com/spreadsheets'],
    });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async appendFormSubmission(data: FormData, spreadsheetId: string): Promise<void> {
    try {
      const values = [
        [
          data.timestamp.toISOString(),
          data.name,
          data.email,
          data.message,
          data.source || 'Contact Form',
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:E', // Adjust range as needed
        valueInputOption: 'USER_ENTERED',
        resource: {
          values,
        },
      });

      console.log('Form submission added to Google Sheets successfully');
    } catch (error) {
      console.error('Error adding form submission to Google Sheets:', error);
      throw new Error('Failed to submit to Google Sheets');
    }
  }

  async createSpreadsheetHeaders(spreadsheetId: string): Promise<void> {
    try {
      const headers = [['Timestamp', 'Name', 'Email', 'Message', 'Source']];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:E1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: headers,
        },
      });

      console.log('Headers created successfully');
    } catch (error) {
      console.error('Error creating headers:', error);
      throw error;
    }
  }
}

// Simple version using environment variables for credentials
export class SimpleGoogleSheetsService {
  private sheets: any;

  constructor() {
    // Use environment variables for credentials
    const credentials = {
      type: 'service_account',
      project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
      private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_SHEETS_CLIENT_EMAIL}`,
    };

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async appendFormSubmission(data: FormData): Promise<void> {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is not set');
    }

    try {
      const values = [
        [
          data.timestamp.toISOString(),
          data.name,
          data.email,
          data.message,
          data.source || 'Contact Form',
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:E',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values,
        },
      });

      console.log('Form submission added to Google Sheets successfully');
    } catch (error) {
      console.error('Error adding form submission to Google Sheets:', error);
      throw new Error('Failed to submit to Google Sheets');
    }
  }
}
