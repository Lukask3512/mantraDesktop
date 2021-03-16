package com.sygic.example.mantra;

public class TwWaypoint {
    double lat;
    double lon;
    String dtStart;
    String dtEnd;
    String wpType;

    public TwWaypoint (double lat, double lon, String dtStart, String dtEnd, String wpType)
    {
        this.lat = lat;
        this.lon = lon;
        this.dtStart = dtStart;
        this.dtEnd = dtEnd;
        this.wpType = wpType;
    }
}
