package com.sygic.example.hello3dwiw.Models;

public class Route {
    private String carId;
    private String coordinatesOfTownsLat;
    private String coordinatesOfTownsLon;
    private String nameOfTowns;
    private String id;

    public Route(String carId, String coordinatesOfTownsLat, String coordinatesOfTownsLon, String nameOfTowns, String id) {
        this.carId = carId;
        this.coordinatesOfTownsLat = coordinatesOfTownsLat;
        this.coordinatesOfTownsLon = coordinatesOfTownsLon;
        this.nameOfTowns = nameOfTowns;
        this.id = id;
    }

    public String getCarId() {
        return carId;
    }

    public void setCarId(String carId) {
        this.carId = carId;
    }

    public String getCoordinatesOfTownsLat() {
        return coordinatesOfTownsLat;
    }

    public void setCoordinatesOfTownsLat(String coordinatesOfTownsLat) {
        this.coordinatesOfTownsLat = coordinatesOfTownsLat;
    }

    public String getCoordinatesOfTownsLon() {
        return coordinatesOfTownsLon;
    }

    public void setCoordinatesOfTownsLon(String coordinatesOfTownsLon) {
        this.coordinatesOfTownsLon = coordinatesOfTownsLon;
    }

    public String getNameOfTowns() {
        return nameOfTowns;
    }

    public void setNameOfTowns(String nameOfTowns) {
        this.nameOfTowns = nameOfTowns;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
