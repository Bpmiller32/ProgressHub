import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { CalendarEvent } from "../types/CalendarEvent";
import { EventsList } from "./scheduleComponents/EventsList";
import { Calendar } from "./scheduleComponents/Calendar";

export const Schedule = () => {
  // States to store the list of events fetched from the Firestore database, count of events for each date.
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventCounts, setEventCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Reference to the "events" collection in the Firestore database.
    const eventsRef = collection(db, "events");

    // Subscribe to real-time updates from Firestore
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      // Map Firestore documents into an array of event objects, adding an "isArchived" property if not present, then filter out events that are marked as archived.
      const eventsData = snapshot.docs
        .map((doc) => ({
          id: doc.id, // Include the document ID as part of the event data.
          date: doc.data().date || '', // Default date to empty string if undefined
          startTime: doc.data().startTime || '', // Default startTime to empty string if undefined
          ...doc.data(), // Spread the rest of the document data.
          isArchived: doc.data().isArchived || false, // Default "isArchived" to false if it's undefined.
        }))
        .filter((event) => !event.isArchived) as CalendarEvent[];

      // Sort events by date (primary) and start time (secondary), with null checks
      eventsData.sort((a, b) => {
        // Ensure dates exist before comparing
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;

        // Compare dates lexicographically
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) {
          return dateCompare;
        }

        // Handle missing start times
        if (!a.startTime && !b.startTime) return 0;
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;

        // Sort by start time if dates are equal
        return a.startTime.localeCompare(b.startTime);
      });

      // Update the events state with sorted and filtered list of events.
      setEvents(eventsData);

      // Calculate the number of events per date.
      const counts: { [key: string]: number } = {};
      eventsData.forEach((event) => {
        if (event.date) {
          counts[event.date] = (counts[event.date] || 0) + 1;
        }
      });

      // Update the eventsCount state with calculated event counts.
      setEventCounts(counts);
    });

    // Cleanup function to unsubscribe from Firestore updates when the component unmounts.
    return () => unsubscribe();
  }, []);

  /* ----------------------------- Render function ---------------------------- */
  return (
    <div className="flex justify-center">
      <div className="w-full px-6 max-w-[1024px] ">
        <Calendar eventCounts={eventCounts} />
        <EventsList events={events} />
      </div>
    </div>
  );
};
