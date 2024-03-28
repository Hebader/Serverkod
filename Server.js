const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Ladda in dotenv-paketet för att läsa .env-filen
const { Client } = require('@notionhq/client'); // Endast en deklaration av Client
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const corsOptions = {
  origin: "http://localhost:3001", // Ersätt med din React-apps ursprung
  optionsSuccessStatus: 200, // vissa äldre browsers (IE11, olika SmartTVs) hanterar 204 som en error
};
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
 
const NOTION_API_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_KEY = process.env.NOTION_API_KEY; // Läs in API-nyckeln från .env-filen
const notion = new Client({
  auth: NOTION_API_KEY,
});
 
//Funktion för att hämta data från Notion
app.post('/api/notion/databas1', async (req, res) => {
    try {
        const response = await axios.post(`${NOTION_API_BASE_URL}/databases/587b3851ebb4484086716104ce9e5d4d/query`, req.body, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2021-05-13'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverfel' });
    }
});

	// Endpoint för att uppdatera timespan för ett projekt i Notion
	app.patch("/api/notion/timespan", async (req, res) => {
    const { pageId, start, end } = req.body;
    console.log(pageId, start, end)
    try {
      const response = await notion.pages.update({
        page_id: pageId,
        properties: {
          // Antag att 'Timespan' är namnet på egenskapen i din Notion-databas
          Timespan: {
            type:"date",
            date: {
              start: start,
              end: end,
            },
          },
        },
      });
    
      res.json({ message: 'Timespan updated successfully', response });
    } catch (error) {
      console.error('Failed to update timespan in Notion:', error);
      res.status(500).json({ message: 'Failed to update timespan', error: error.message });
    }
  });
////////////////


 app.post('/api/notion/databas2', async (req, res) => {
     try {
         const response = await axios.post(`${NOTION_API_BASE_URL}/databases/7c27b5453a7a49e5b4314926fc51b85d/query`, req.body, {
             headers: {
                 'Authorization': `Bearer ${NOTION_API_KEY}`,
                 'Notion-Version': '2021-05-13'
             }
         });
         res.json(response.data);
     } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Serverfel' });
     }
 });
 app.post('/api/notion/databas3', async (req, res) => {
   try {
       const response = await axios.post(`${NOTION_API_BASE_URL}/databases/e9d6cc1e1cd240a9b7f8c160921358e5/query`, req.body, {
           headers: {
               'Authorization': `Bearer ${NOTION_API_KEY}`,
               'Notion-Version': '2021-05-13'
           }
       });
       res.json(response.data);
   } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Serverfel' });
   }
 });
 
 
console.log('hej');
 
app.post('/getdatabasebyid', async (req, res) => {
  const databaseId = req.body.databaseId;
  const privateID = req.body.privateID;

  const notion = new Client({ auth: 'secret_rjSOXoc32cwyEA6cf6E2queEs9Jk74iOvlxj9p6w61i' });

  try {
    const response = await notion.databases.query({
      database_id: databaseId
    });

    // Filtrera resultaten baserat på privateID
    const filteredResults = response.results.filter(page => {
      // Kontrollera om 'PrivateID' finns och om det är samma som privateID från klienten
      return page.properties.PrivateID && page.properties.PrivateID.rich_text.length > 0 && page.properties.PrivateID.rich_text[0].text.content === privateID;
    });

    res.json(filteredResults);
  } catch (error) {
    console.error('Fel vid hämtning av data från Notion:', error);
    res.status(500).send('Server error when fetching data from Notion');
  }
});
 
 
 /* Våran Notion Login */
 
 app.post('/login', async (req, res) => {
  const { name, password, privateID } = req.body;
  const notion = new Client({auth: NOTION_API_KEY});
  const databaseId = '7c27b5453a7a49e5b4314926fc51b85d';
 
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Name',
            title: {
              equals: name,
            },
          },
          {
            property: 'Password',
            rich_text: {
              equals: password,
            },
          },
          {
            property:"PrivateID",
            rich_text: {
              equals: privateID,
            }
          }
        ],
      },
    });
 
    if (response.results.length > 0) {
      const userPrivateID = response.results[0].properties.PrivateID.rich_text[0].text.content;

      res.status(200).json({ message: 'Autentisering lyckades', privateID: userPrivateID });
    } else {
      res.status(401).json({ message: 'Autentisering misslyckades' });
    }
  } catch (error) {
    console.error('Error with Notion API:', error);
    res.status(500).json({ message: 'Serverfel vid autentisering' });
  }
});

//LOGTIME
app.post('/api/logtime', async (req, res) => {
  console.log('Received request to log time:', req.body);
  const { project, date, hours, note, employee } = req.body;

  try {
    // Anropa Notion API för att skapa en ny post i databasen med tidrapportdata
    const response = await axios.post(
      `${NOTION_API_BASE_URL}/pages`, // Använd endpoint för att skapa en ny sida
      {
        parent: { database_id: 'e9d6cc1e-1cd2-40a9-b7f8-c160921358e5' },
        properties: {
          Project: { type: 'relation', relation: [{ id: project }] },
          Date: { type: 'date', date: { start: date } },
          Hours: { type: 'number', number: parseInt(hours) },
          Note: { type: 'title', title: [{ text: { content: note } }] },
          EmployeeRelation: { type: 'relation', relation: [{ id: employee }] },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2021-05-13',
        },
      }
    );

    console.log('Notion API response:', response.data);
    res
      .status(200)
      .json({ message: 'Time logged successfully', data: response.data });
  } catch (error) {
    console.error('Error handling request:', error); // Lägg till loggning här
    res.status(500).json({ message: 'Failed to log time to Notion' });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const notion = new Client({ auth: NOTION_API_KEY });

    // Använd din egen database_id för employees
    const databaseId = '7c27b5453a7a49e5b4314926fc51b85d';

    // Skicka en förfrågan för att hämta data från Notion-databasen
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    console.log(response.data);

    // Filtrera ut employees från Notion-responsen
    const employees = response.results.map((page) => {
      return {
        id: page.id,
        name: page.properties.Name.title[0].plain_text,
      };
    });
    console.log('EMPLOYEES!!', employees);
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfel vid hämtning av projekt' });
  }
});
 
 app.get('/api/projects', async (req, res) => {
  try {
    const notion = new Client({ auth: NOTION_API_KEY });
 
    // Använd din egen database_id för ditt projekt
    const databaseId = '587b3851ebb4484086716104ce9e5d4d';
 
    // Skicka en förfrågan för att hämta data från Notion-databasen
    const response = await notion.databases.query({
      database_id: databaseId,
      // private_id: privateID
    });
 
    // Filtrera ut projektnamnen från Notion-responsen
    const projects = response.results.map(page => {
      return {
        id: page.id,
        name: page.properties.Name.title[0].plain_text
      };
    });
 
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Serverfel vid hämtning av projekt' });
  }
});

 
app.use(express.json());
app.use(cors(corsOptions)); // Använd CORS-middleware med konfigurationen

 
 const PORT = process.env.PORT || 3001;
 app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});