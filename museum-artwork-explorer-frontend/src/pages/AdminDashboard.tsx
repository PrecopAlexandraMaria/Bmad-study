import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, IconButton, Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Autocomplete, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import RefreshIcon from '@mui/icons-material/Refresh';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';

const API_URL = 'http://localhost:3000';

interface City { CityID: number; Name: string; CountryID: number; }
interface Artist { ArtistID: number; FullName: string; Country: string; BirthYear: number; DeathYear: number; }
interface Style { StyleID: number; Name: string; Period: string; }
interface Room { RoomID: number; Name: string; Floor: number; MuseumID: number; MuseumName?: string; }
interface Museum { MuseumID: number; Name: string; CityID: number; City?: string; FoundedYear: number; Latitude: number; Longitude: number; }
interface Artwork { ArtworkID: number; Title: string; YearCreated: number; ArtistID: number; ArtistName?: string; StyleID: number; RoomID: number; }
interface Exhibition { ExhibitionID: number; Name: string; StartDate: string; EndDate: string; MuseumID: number; MuseumName?: string; }
interface Trivia { TriviaID: number; EntityType: string; EntityID: number; Fact: string; EntityName?: string; }

interface DataState {
  searches: string[];
  museums: Museum[];
  artworks: Artwork[];
  artists: Artist[];
  styles: Style[];
  cities: City[];
  rooms: Room[];
  exhibitions: Exhibition[];
  trivia: Trivia[];
}

function AdminDashboard() {
  const [secret, setSecret] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const [data, setData] = useState<DataState>({
    searches: [], museums: [], artworks: [], artists: [], styles: [], cities: [], rooms: [], exhibitions: [], trivia: []
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const handleLogin = async () => {
    const trimmedSecret = secret.trim();
    if (!trimmedSecret) {
      alert('Please enter the secret key.');
      return;
    }

    try {
      const pingRes = await fetch(`${API_URL}/api/ping`);
      const pingData = await pingRes.json();
      
      if (pingData.version !== 'v2-admin-master') {
        alert('Server Mismatch: Your backend is running an old version. Please restart the backend server.');
        return;
      }

      const res = await fetch(`${API_URL}/api/admin/verify`, {
        method: 'GET',
        headers: { 'x-admin-secret': trimmedSecret }
      });
      
      if (res.ok) {
        setSecret(trimmedSecret); 
        setIsAuthorized(true);
      } else {
        const text = await res.text();
        alert(`Authentication Failed (${res.status}): ${text || 'Invalid secret key.'}`);
      }
    } catch (err) { 
      console.error('Login Error:', err);
      alert('Network Error: Could not connect to the backend server.'); 
    }
  };

  const fetchData = async () => {
    const h = { 'x-admin-secret': secret };
    
    const fetchSafe = async (endpoint: string, isPublic: boolean = false) => {
      try {
        const url = `${API_URL}${endpoint}`;
        const options = isPublic ? {} : { headers: h };
        const res = await fetch(url, options);
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          return { error: json.error || `HTTP ${res.status}` };
        }
        return { data: await res.json() };
      } catch (err: any) {
        return { error: err.message };
      }
    };

    const [ps, m, a, ar, s, c, r, ex, t] = await Promise.all([
      fetchSafe('/api/popular-searches', true),
      fetchSafe('/api/admin/museums'),
      fetchSafe('/api/admin/artworks'),
      fetchSafe('/api/admin/artists'),
      fetchSafe('/api/admin/styles'),
      fetchSafe('/api/admin/cities'),
      fetchSafe('/api/admin/rooms'),
      fetchSafe('/api/admin/exhibitions'),
      fetchSafe('/api/admin/trivia')
    ]);

    setData({
      searches: ps.data || [],
      museums: m.data || [],
      artworks: a.data || [],
      artists: ar.data || [],
      styles: s.data || [],
      cities: c.data || [],
      rooms: r.data || [],
      exhibitions: ex.data || [],
      trivia: t.data || []
    });

    const failures = [];
    if (m.error) failures.push(`Museums: ${m.error}`);
    if (a.error) failures.push(`Artworks: ${a.error}`);
    if (ar.error) failures.push(`Artists: ${ar.error}`);
    if (ex.error) failures.push(`Exhibitions: ${ex.error}`);
    if (t.error) failures.push(`Trivia: ${t.error}`);
    
    if (failures.length > 0) {
      alert(`⚠️ Partial Sync Issue:\n\n${failures.join('\n')}`);
    }
  };

  useEffect(() => { if (isAuthorized) fetchData(); }, [isAuthorized]);

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpointMap: any = { 1: 'museums', 2: 'artworks', 3: 'artists', 4: 'styles', 5: 'cities', 6: 'rooms', 7: 'exhibitions', 8: 'trivia' };
    const endpoint = endpointMap[tabValue];
    
    try {
      const res = await fetch(`${API_URL}/api/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify(editItem)
      });
      if (res.ok) { 
        setOpenDialog(false); 
        fetchData(); 
      } else {
        const errData = await res.json();
        alert(`System Failure: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) { alert('Network connection lost.'); }
  };

  const handleDelete = async (table: string, idField: string, id: any) => {
    if (!window.confirm(`MASTER ACTION: Purge record and all related dependencies?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/${table}/${idField}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': secret }
      });
      if (res.ok) fetchData();
      else {
        const errData = await res.json();
        alert(`Purge Failed: ${errData.error}`);
      }
    } catch (err) { alert('Network error'); }
  };

  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<'Artist' | 'Artwork' | 'Trivia'>('Artwork');
  const [aiResults, setAiResults] = useState<any[]>([]);

  const handleAIGenerate = async () => {
    if (!aiPrompt) return alert('Please enter a prompt for the AI.');
    setAiLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ category: aiCategory, prompt: aiPrompt })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResults(data);
      } else {
        const err = await res.json();
        alert(`AI Error: ${err.error}`);
      }
    } catch (err) { alert('AI Server unreachable.'); }
    setAiLoading(false);
  };

  const handleAISave = async (items: any[]) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/save-ai-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ category: aiCategory, items })
      });
      if (res.ok) {
        alert(`Successfully imported ${items.length} records!`);
        setAiResults([]);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Save Error: ${err.error}`);
      }
    } catch (err) { alert('Network error during save.'); }
  };

  const openForm = (item: any = null) => {
    if (tabValue === 1) setEditItem(item || { Name: '', CityID: '', FoundedYear: '', Latitude: '', Longitude: '' });
    else if (tabValue === 2) setEditItem(item || { Title: '', YearCreated: '', ArtistID: '', StyleID: '', RoomID: '' });
    else if (tabValue === 3) setEditItem(item || { FullName: '', Country: '', BirthYear: '', DeathYear: '' });
    else if (tabValue === 4) setEditItem(item || { Name: '', Period: '' });
    else if (tabValue === 5) setEditItem(item || { Name: '', CountryID: 1 });
    else if (tabValue === 6) setEditItem(item || { Name: '', Floor: 1, MuseumID: '' });
    else if (tabValue === 7) setEditItem(item || { Name: '', StartDate: '', EndDate: '', MuseumID: '' });
    else if (tabValue === 8) setEditItem(item || { EntityType: 'Museum', EntityID: '', Fact: '' });
    else setEditItem(null);
    setOpenDialog(true);
  };

  if (!isAuthorized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 3 }}>Master Control Panel</Typography>
          <TextField 
            fullWidth 
            label="Secret Key" 
            type="password" 
            value={secret} 
            onChange={(e) => setSecret(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            sx={{ mb: 3 }} 
          />
          <Button variant="contained" fullWidth onClick={handleLogin}>Authenticate</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Master Database Manager</Typography>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={fetchData}><RefreshIcon /></IconButton>
          {tabValue > 0 && tabValue < 9 && <Button startIcon={<AddIcon />} variant="contained" onClick={() => openForm()}>Create Record</Button>}
        </Stack>
      </Box>
      
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        <Tab label="Searches" />
        <Tab label="Museums" />
        <Tab label="Artworks" />
        <Tab label="Artists" />
        <Tab label="Styles" />
        <Tab label="Cities" />
        <Tab label="Rooms" />
        <Tab label="Exhibitions" />
        <Tab label="Trivia" />
      </Tabs>

      <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <List disablePadding>
          {tabValue === 0 && data.searches.map(term => (
            <ListItem key={term} divider secondaryAction={<IconButton color="error" onClick={() => handleDelete('ArtworkSearchCount', 'SearchTerm', term)}><DeleteIcon /></IconButton>}>
              <ListItemText primary={term} />
            </ListItem>
          ))}
          {tabValue === 1 && data.museums.map(m => (
            <ListItem key={m.MuseumID} divider secondaryAction={<Box><IconButton onClick={() => openForm(m)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDelete('Museum', 'MuseumID', m.MuseumID)}><DeleteIcon /></IconButton></Box>}>
              <ListItemText primary={m.Name} secondary={`${m.City} • Est. ${m.FoundedYear}`} />
            </ListItem>
          ))}
          {tabValue === 2 && data.artworks.map(a => (
            <ListItem key={a.ArtworkID} divider secondaryAction={<Box><IconButton onClick={() => openForm(a)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDelete('Artwork', 'ArtworkID', a.ArtworkID)}><DeleteIcon /></IconButton></Box>}>
              <ListItemText primary={a.Title} secondary={`${a.ArtistName} • ${a.YearCreated}`} />
            </ListItem>
          ))}
          {tabValue === 3 && data.artists.map(ar => (
            <ListItem key={ar.ArtistID} divider secondaryAction={<Box><IconButton onClick={() => openForm(ar)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDelete('Artist', 'ArtistID', ar.ArtistID)}><DeleteIcon /></IconButton></Box>}>
              <ListItemText primary={ar.FullName} secondary={ar.Country} />
            </ListItem>
          ))}
          {tabValue === 4 && data.styles.map(s => (
            <ListItem key={s.StyleID} divider secondaryAction={<Box><IconButton onClick={() => openForm(s)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDelete('ArtStyle', 'StyleID', s.StyleID)}><DeleteIcon /></IconButton></Box>}>
              <ListItemText primary={s.Name} secondary={s.Period} />
            </ListItem>
          ))}
          {tabValue === 5 && data.cities.map(c => (
            <ListItem key={c.CityID} divider secondaryAction={<Box><IconButton onClick={() => openForm(c)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDelete('City', 'CityID', c.CityID)}><DeleteIcon /></IconButton></Box>}>
              <ListItemText primary={c.Name} />
            </ListItem>
          ))}
          {tabValue === 6 && data.rooms.map(r => (
            <ListItem key={r.RoomID} divider secondaryAction={<Box><IconButton onClick={() => openForm(r)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDelete('Room', 'RoomID', r.RoomID)}><DeleteIcon /></IconButton></Box>}>
              <ListItemText primary={r.Name} secondary={`${r.MuseumName} • Floor ${r.Floor}`} />
            </ListItem>
          ))}
          {tabValue === 7 && data.exhibitions.map(ex => (
            <ListItem key={ex.ExhibitionID} divider secondaryAction={<Box><IconButton onClick={() => openForm(ex)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDelete('Exhibition', 'ExhibitionID', ex.ExhibitionID)}><DeleteIcon /></IconButton></Box>}>
              <ListItemText primary={ex.Name} secondary={`${ex.MuseumName} • ${ex.StartDate} to ${ex.EndDate}`} />
            </ListItem>
          ))}
          {tabValue === 8 && data.trivia.map(t => (
            <ListItem key={t.TriviaID} divider secondaryAction={<Box><IconButton onClick={() => openForm(t)}><EditIcon /></IconButton><IconButton color="error" onClick={() => handleDelete('Trivia', 'TriviaID', t.TriviaID)}><DeleteIcon /></IconButton></Box>}>
              <ListItemText primary={t.Fact} secondary={`${t.EntityType}: ${t.EntityName}`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleUpsert}>
          <DialogTitle>Administrative Form</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {tabValue === 1 && <>
                <TextField label="Name" fullWidth value={editItem?.Name || ''} onChange={(e) => setEditItem({...editItem, Name: e.target.value})} required />
                <Autocomplete
                  options={data.cities}
                  getOptionLabel={(o) => o.Name}
                  isOptionEqualToValue={(o,v) => o.CityID === v.CityID}
                  value={data.cities.find(c => c.CityID === editItem?.CityID) || null}
                  onChange={(_, v) => setEditItem({...editItem, CityID: v?.CityID})}
                  renderInput={(params) => <TextField {...params} label="City" required />}
                />
                <TextField label="Founded Year" type="number" fullWidth value={editItem?.FoundedYear || ''} onChange={(e) => setEditItem({...editItem, FoundedYear: e.target.value})} />
                <TextField label="Latitude" type="number" fullWidth value={editItem?.Latitude || ''} onChange={(e) => setEditItem({...editItem, Latitude: e.target.value})} />
                <TextField label="Longitude" type="number" fullWidth value={editItem?.Longitude || ''} onChange={(e) => setEditItem({...editItem, Longitude: e.target.value})} />
              </>}
              {tabValue === 2 && <>
                <TextField label="Artwork Title" fullWidth value={editItem?.Title || ''} onChange={(e) => setEditItem({...editItem, Title: e.target.value})} required />
                <Autocomplete
                  options={data.artists}
                  getOptionLabel={(o) => o.FullName}
                  isOptionEqualToValue={(o,v) => o.ArtistID === v.ArtistID}
                  value={data.artists.find(a => a.ArtistID === editItem?.ArtistID) || null}
                  onChange={(_, v) => setEditItem({...editItem, ArtistID: v?.ArtistID})}
                  renderInput={(params) => <TextField {...params} label="Artist" required />}
                />
                <Autocomplete
                  options={data.styles}
                  getOptionLabel={(o) => o.Name}
                  isOptionEqualToValue={(o,v) => o.StyleID === v.StyleID}
                  value={data.styles.find(s => s.StyleID === editItem?.StyleID) || null}
                  onChange={(_, v) => setEditItem({...editItem, StyleID: v?.StyleID})}
                  renderInput={(params) => <TextField {...params} label="Style" required />}
                />
                <Autocomplete
                  options={data.rooms}
                  getOptionLabel={(o) => `${o.Name} (${o.MuseumName})`}
                  isOptionEqualToValue={(o,v) => o.RoomID === v.RoomID}
                  value={data.rooms.find(r => r.RoomID === editItem?.RoomID) || null}
                  onChange={(_, v) => setEditItem({...editItem, RoomID: v?.RoomID})}
                  renderInput={(params) => <TextField {...params} label="Room" required />}
                />
                <TextField label="Year Created" type="number" fullWidth value={editItem?.YearCreated || ''} onChange={(e) => setEditItem({...editItem, YearCreated: e.target.value})} />
              </>}
              {tabValue === 3 && <>
                <TextField label="Full Name" fullWidth value={editItem?.FullName || ''} onChange={(e) => setEditItem({...editItem, FullName: e.target.value})} required />
                <TextField label="Country" fullWidth value={editItem?.Country || ''} onChange={(e) => setEditItem({...editItem, Country: e.target.value})} />
                <TextField label="Birth Year" type="number" fullWidth value={editItem?.BirthYear || ''} onChange={(e) => setEditItem({...editItem, BirthYear: e.target.value})} />
                <TextField label="Death Year" type="number" fullWidth value={editItem?.DeathYear || ''} onChange={(e) => setEditItem({...editItem, DeathYear: e.target.value})} />
              </>}
              {tabValue === 4 && <>
                <TextField label="Style Name" fullWidth value={editItem?.Name || ''} onChange={(e) => setEditItem({...editItem, Name: e.target.value})} required />
                <TextField label="Period" fullWidth value={editItem?.Period || ''} onChange={(e) => setEditItem({...editItem, Period: e.target.value})} />
              </>}
              {tabValue === 5 && <>
                <TextField label="City Name" fullWidth value={editItem?.Name || ''} onChange={(e) => setEditItem({...editItem, Name: e.target.value})} required />
              </>}
              {tabValue === 6 && <>
                <TextField label="Room Name" fullWidth value={editItem?.Name || ''} onChange={(e) => setEditItem({...editItem, Name: e.target.value})} required />
                <TextField label="Floor" type="number" fullWidth value={editItem?.Floor || ''} onChange={(e) => setEditItem({...editItem, Floor: e.target.value})} />
                <Autocomplete
                  options={data.museums}
                  getOptionLabel={(o) => o.Name}
                  isOptionEqualToValue={(o,v) => o.MuseumID === v.MuseumID}
                  value={data.museums.find(m => m.MuseumID === editItem?.MuseumID) || null}
                  onChange={(_, v) => setEditItem({...editItem, MuseumID: v?.MuseumID})}
                  renderInput={(params) => <TextField {...params} label="Museum" required />}
                />
              </>}
              {tabValue === 7 && <>
                <TextField label="Exhibition Name" fullWidth value={editItem?.Name || ''} onChange={(e) => setEditItem({...editItem, Name: e.target.value})} required />
                <TextField label="Start Date" placeholder="YYYY-MM-DD" fullWidth value={editItem?.StartDate || ''} onChange={(e) => setEditItem({...editItem, StartDate: e.target.value})} />
                <TextField label="End Date" placeholder="YYYY-MM-DD" fullWidth value={editItem?.EndDate || ''} onChange={(e) => setEditItem({...editItem, EndDate: e.target.value})} />
                <Autocomplete
                  options={data.museums}
                  getOptionLabel={(o) => o.Name}
                  isOptionEqualToValue={(o,v) => o.MuseumID === v.MuseumID}
                  value={data.museums.find(m => m.MuseumID === editItem?.MuseumID) || null}
                  onChange={(_, v) => setEditItem({...editItem, MuseumID: v?.MuseumID})}
                  renderInput={(params) => <TextField {...params} label="Museum" required />}
                />
              </>}
              {tabValue === 8 && <>
                <FormControl fullWidth>
                  <InputLabel id="trivia-category-label">Category</InputLabel>
                  <Select
                    labelId="trivia-category-label"
                    label="Category"
                    value={editItem?.EntityType || 'Museum'}
                    onChange={(e) => setEditItem({...editItem, EntityType: e.target.value, EntityID: ''})}
                  >
                    <MenuItem value="Museum">Museum</MenuItem>
                    <MenuItem value="Artist">Artist</MenuItem>
                    <MenuItem value="Artwork">Artwork</MenuItem>
                  </Select>
                </FormControl>

                {editItem?.EntityType === 'Museum' && (
                  <Autocomplete
                    key="select-museum"
                    options={data.museums}
                    getOptionLabel={(o) => o.Name || ''}
                    isOptionEqualToValue={(o,v) => o.MuseumID === v.MuseumID}
                    noOptionsText="No museums found in database"
                    value={data.museums.find(m => m.MuseumID === editItem?.EntityID) || null}
                    onChange={(_, v) => setEditItem({...editItem, EntityID: v?.MuseumID || ''})}
                    renderInput={(params) => <TextField {...params} label="Select Museum" required />}
                  />
                )}

                {editItem?.EntityType === 'Artist' && (
                  <Autocomplete
                    key="select-artist"
                    options={data.artists}
                    getOptionLabel={(o) => o.FullName || ''}
                    isOptionEqualToValue={(o,v) => o.ArtistID === v.ArtistID}
                    noOptionsText="No artists found in database"
                    value={data.artists.find(a => a.ArtistID === editItem?.EntityID) || null}
                    onChange={(_, v) => setEditItem({...editItem, EntityID: v?.ArtistID || ''})}
                    renderInput={(params) => <TextField {...params} label="Select Artist" required />}
                  />
                )}

                {editItem?.EntityType === 'Artwork' && (
                  <Autocomplete
                    key="select-artwork"
                    options={data.artworks}
                    getOptionLabel={(o) => o.Title || ''}
                    isOptionEqualToValue={(o,v) => o.ArtworkID === v.ArtworkID}
                    noOptionsText="No artworks found in database"
                    value={data.artworks.find(a => a.ArtworkID === editItem?.EntityID) || null}
                    onChange={(_, v) => setEditItem({...editItem, EntityID: v?.ArtworkID || ''})}
                    renderInput={(params) => <TextField {...params} label="Select Artwork" required />}
                  />
                )}

                <TextField 
                  label="Fun Fact" 
                  fullWidth 
                  multiline 
                  rows={4} 
                  value={editItem?.Fact || ''} 
                  onChange={(e) => setEditItem({...editItem, Fact: e.target.value})} 
                  required 
                  placeholder="Enter a surprising or interesting fact..."
                />
              </>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Execute Update</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Button sx={{ mt: 4 }} color="inherit" onClick={() => setIsAuthorized(false)}>Lock System</Button>
    </Box>
  );
}

export default AdminDashboard;
