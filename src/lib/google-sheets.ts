import { google } from "googleapis";
import fs from "fs";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), "service-account.json"),
    scopes: SCOPES,
  });

  return google.sheets({ version: "v4", auth });
}

export async function appendRiddle(data: {
  name: string;
  topic: string;
  riddle: string;
  answer: string;
}) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const range = "Sheet1!A:D";

  // 1. Check if headers exist
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet1!A1:D1",
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    // Create headers if they don't exist
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1:D1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["Name", "Riddle Topic", "Riddle", "Answer"]],
      },
    });

    // Formatting: Bold headers, auto-resize, wrap text
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  horizontalAlignment: "CENTER",
                },
              },
              fields: "userEnteredFormat(textFormat,horizontalAlignment)",
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: 4,
              },
            },
          },
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0 },
              cell: {
                userEnteredFormat: {
                  wrapStrategy: "WRAP",
                },
              },
              fields: "userEnteredFormat(wrapStrategy)",
            },
          },
        ],
      },
    });
  }

  // 2. Append the new row
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [[data.name, data.topic, data.riddle, data.answer]],
    },
  });

  // 3. Re-apply auto-resize to ensure new content fits well (optional but good for 'production-ready')
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 4,
            },
          },
        },
      ],
    },
  });
}
