interface Log{
    creator: string;
    dateCreated: string;
    startDateTime: string;
    endDateTime: string;
    note: string;
    location?: string;
    videos?: string[];
    photos?: string[]
}

function createLog (){
    const dateCreated = new Date();
    return
}

function retrieveLogs() {
    return
}


/*class DailyLog {
    




private readonly creator: string;
    private readonly _dateCreated: Date;
   
    private startDateTime: Date;
    private endDateTime: Date;

    private logNote: LogNotes;

    private location: string;

    constructor (
        creator : string,
        startDateTime: Date,
        endDateTime: Date,
    ) {
        this.creator = creator;
        this._dateCreated = new Date(); 

        this.startDateTime= startDateTime;
        this.endDateTime = endDateTime;      

        this.logNote = new LogNotes;

        this.location = "";
    }

    public get dateCreated() {
        return this._dateCreated.toISOString;
    }

}*/