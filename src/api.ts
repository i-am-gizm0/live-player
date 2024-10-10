export type Program = ProgramTiming & {
  programName: string;
  episodeName: string;
  img: {
    synopsis: string;
    hero: string;
  };
  airing: "NEW" | "LIVE" | "";
  gameId: string;
};

export type ProgramTiming = {
  start: Date;
  lengthMs: number;
};
