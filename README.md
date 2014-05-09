
## Structure

### Route
#### `application`: route, controller
#### `days`: route, controller
- `view 'day-view'`: controller
    - each _dailyGoals_
        - `view 'day-activities-view'`: controller
            - `bar-chart 'Activity Minutes'`: component
            - each _activities_
                - `next-activity-button`: component
- `line-chart 'Total'`: component
- each _goals_
    - `view 'goal-view'`: controller

#### `notes`: route, controller
- each
    - `view 'note-view'`: controller

### Modals
- `modal-goal`: controller
    - `modal-dialog`: component
- `modal-activity`: controller
    - `modal-dialog`: component
- `modal-note`: controller

## Credit
[ember-dropbox-datastore-adapter.js](http://discuss.emberjs.com/t/im-creating-a-dropbox-datastore-adapter/3738) by hiroshi 

## Todo:
