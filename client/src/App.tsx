import { useState, useEffect } from 'react';
import EntryForm from './EntryForm';
import EntryList from './EntryList';
import { NavBar } from './NavBar';
import { Entry } from './data';
import './App.css';

export default function App() {
  /* What is being currently edited:
   * undefined - nothing, display entries
   * null - creating a new entry
   * defined - the entry being edited
   */
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<Entry | null | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    async function getEntries() {
      try {
        const res = await fetch('/api/entries/');
        if (!res.ok) {
          throw Error(`Response Code: ${res.status}`);
        }
        setEntries(await res.json());
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    getEntries();
  }, []);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error('Fetch error:', error);
    return (
      <div>
        Error! {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
  return (
    <>
      <NavBar onEntries={() => setEditing(undefined)} />
      {editing !== undefined && (
        <EntryForm
          entries={entries}
          entry={editing}
          onSubmit={() => setEditing(undefined)}
        />
      )}
      {editing === undefined && (
        <EntryList
          entries={entries}
          onCreate={() => setEditing(null)}
          onEdit={(entry) => setEditing(entry)}
        />
      )}
    </>
  );
}
