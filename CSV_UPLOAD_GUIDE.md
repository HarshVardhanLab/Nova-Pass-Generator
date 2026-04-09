# CSV Upload Guide

## Steps to Upload CSV

### 1. Login
- Go to http://localhost:5173
- Username: `harshvardhan`
- Password: `harsh9837`

### 2. Create an Event
- Click "Events" in the sidebar
- Click "Create Event" button
- Fill in:
  - Name: `HackGear 2.0`
  - Description: `Hackathon Event`
  - Date: Select any date
  - Venue: `Your Venue`
- Click "Create"

### 3. Upload CSV
- Click on the event you just created
- Click "CSV Manager" tab or button
- Click "Upload CSV" button
- Select your `Hackgear2.0-final.csv` file
- Wait for success message

### 4. Verify Upload
- You should see a success toast notification
- The data grid should populate with your team members
- Check that all 4 members from Royal war Tech team are visible

## CSV Format (Your file is correct!)

Your CSV has the correct format:

```csv
Team Id,Team Name,Name,Status,Email
ROY131,Royal war Tech,Sambhav pachauri,Leader,pachaurisambhav854@gmail.com
ROY131,Royal war Tech,Pankaj Kumar,Member,golapankaj75@gmail.com
ROY131,Royal war Tech,Riya Verma,Member,riyaverma7919@gmail.com
ROY131,Royal war Tech,Prabhat Shukla,Member,prabhatshukla9015@gmail.com
```

✅ All required columns present
✅ Status values are correct (Leader/Member)
✅ Email addresses are valid
✅ Team information is consistent

## Troubleshooting

### Error: "Event not found"
- Make sure you created an event first
- Make sure you're on the correct event's CSV Manager page
- Check the URL - it should be like: `/events/1/csv`

### Error: "Missing required columns"
- Your CSV is fine! This shouldn't happen
- Make sure the file isn't corrupted
- Try re-downloading the CSV file

### Error: "Upload failed"
- Check browser console (F12) for detailed error
- Make sure backend is running on port 8000
- Check backend logs for errors

### No error but nothing happens
- Check browser console (F12)
- Make sure you're logged in
- Try refreshing the page

## After Upload

Once uploaded successfully:

1. **Generate Passes**
   - Go to "Pass Generator" tab
   - Upload a template PDF (or use default)
   - Click "Generate Passes"
   - Download generated passes

2. **View Members**
   - All members will appear in the data grid
   - You can edit member details inline
   - Export updated data as CSV

3. **QR Scanner**
   - Use the scanner to check in members
   - Scan QR codes from generated passes
   - Track attendance in real-time

## Expected Result

After uploading `Hackgear2.0-final.csv`:

- **Teams Created**: 1 (Royal war Tech)
- **Members Created**: 4
  - Sambhav pachauri (Leader)
  - Pankaj Kumar (Member)
  - Riya Verma (Member)
  - Prabhat Shukla (Member)

All members will have:
- QR codes generated automatically
- Unique member IDs
- Email addresses for notifications
