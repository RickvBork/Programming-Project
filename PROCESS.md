# day 2 (Week 2)

I have added the line graph. I chose to include points into the graph denoting the year (season) in which the race took place.
The season circles serve a goal, to show the user gaps in continuation of a race, as sometimes a race is excluded from the calander,
only to be added later.

I have also added a focusline, however, this may be deleted later as it serves little purpose.

The goal is to add a click effect on the circles, and maybe a tooltip on circles where the F1 regulations have changed.

The update function uses a d3 library, d3-interpolate-path. I have chosen for this library for a single reason, the update method for
line graphs built into d3 does not take into account a change in datapoints. See: https://peterbeshai.com/d3-interpolate-path/ for the
difference between default interpolation and interpolation with the library included.

The update function uses a dict with variables that are accessed via indexing. The goal is to add all update variables for all graphs 
into this dict. Otherwhise variables have to be created locally, but passed along multiple functions, creating a dataflow that is difficult
to follow.
