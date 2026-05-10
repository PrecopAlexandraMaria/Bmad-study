# System Architecture: Museum Artwork Explorer

## 1. Overview

This document describes the system architecture for the Museum Artwork Explorer website. The architecture follows a classic three-tier model, composed of a dynamic frontend client, a backend API server, and a relational database.

This design separates concerns, allowing the frontend and backend to be developed, deployed, and scaled independently.

## 2. Technology Stack

*   **Frontend:** **React**. A modern JavaScript library for building dynamic user interfaces.
    *   **Mapping:** A library like **Leaflet** or **Mapbox GL JS** will be used to implement the interactive map view.
    *   **UI Components:** A component library such as **Material-UI** or **Bootstrap** will be used to ensure a consistent, responsive, and mobile-first design suitable for tourists.

*   **Backend:** **Node.js** with **Express.js**. A lightweight and powerful framework for building the RESTful API.
    *   **Database Connector:** A well-supported library like `tedious` or `mssql` will be used to establish a connection with the SQL Server database.

*   **Database:** **Microsoft SQL Server**. The application will use the pre-defined SQL schema provided by the user.

## 3. Backend Architecture

The backend will serve as a RESTful API that the React frontend consumes.

*   **Data Access Layer (DAL):** A dedicated module will be created to handle all database interactions. This layer will contain all the SQL queries and logic required to fetch data from the database and format it for the API responses. It will abstract the database from the API route handlers.

*   **API Endpoints:** The API will expose endpoints for each resource. All table and column names from the existing schema will be used as-is.

    *   `GET /api/search/artworks?q={query}`: Searches artworks by title.
    *   `GET /api/museums`: Retrieves a list of all museums for the map view.
    *   `GET /api/museums/{id}`: Fetches detailed information for a specific museum.
    *   `GET /api/museums/{id}/artworks`: Fetches all artworks located in a specific museum.
    *   `GET /api/exhibitions`: Retrieves a list of all current and upcoming exhibitions.
    *   `GET /api/exhibitions/{id}`: Fetches detailed information for a specific exhibition, including its artworks.
    *   `GET /api/artists/{id}`: Fetches details for a specific artist and their artworks.
    *   `GET /api/cities`: Retrieves a list of all cities.
    *   `GET /api/countries`: Retrieves a list of all countries.

## 4. Database Design

The application's database is pre-defined and will be treated as the single source of truth.

*   **No Modifications:** The backend services will be designed strictly to read from the tables as defined. The application will not perform any migrations or schema-altering operations (`ALTER`, `CREATE`, `DROP`).

*   **Schema Reference:** The following SQL schema will be used:
    ```sql
    -- Country Table
    CREATE TABLE Country (
        CountryID INT IDENTITY PRIMARY KEY,
        Name VARCHAR(100) NOT NULL UNIQUE
    );

    -- City Table
    CREATE TABLE City (
        CityID INT IDENTITY PRIMARY KEY,
        CountryID INT NOT NULL,
        Name VARCHAR(100) NOT NULL,
        CONSTRAINT FK_City_Country FOREIGN KEY (CountryID) REFERENCES Country(CountryID)
    );

    -- Museum Table
    CREATE TABLE Museum (
        MuseumID INT IDENTITY PRIMARY KEY,
        CityID INT NOT NULL,
        Name VARCHAR(150) NOT NULL,
        FoundedYear INT,
        CONSTRAINT FK_Museum_City FOREIGN KEY (CityID) REFERENCES City(CityID)
    );

    -- Room Table
    CREATE TABLE Room (
        RoomID INT IDENTITY PRIMARY KEY,
        MuseumID INT NOT NULL,
        Name VARCHAR(100) NOT NULL,
        Floor INT,
        CONSTRAINT FK_Room_Museum FOREIGN KEY (MuseumID) REFERENCES Museum(MuseumID)
    );

    -- Curator Table
    CREATE TABLE Curator (
        CuratorID INT IDENTITY PRIMARY KEY,
        MuseumID INT NOT NULL,
        FullName VARCHAR(150) NOT NULL,
        Email VARCHAR(100),
        CONSTRAINT FK_Curator_Museum FOREIGN KEY (MuseumID) REFERENCES Museum(MuseumID)
    );

    -- Artist Table
    CREATE TABLE Artist (
        ArtistID INT IDENTITY PRIMARY KEY,
        FullName VARCHAR(150) NOT NULL,
        Country VARCHAR(100),
        BirthYear INT,
        DeathYear INT
    );

    -- ArtStyle Table
    CREATE TABLE ArtStyle (
        StyleID INT IDENTITY PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Period VARCHAR(100)
    );

    -- Artwork Table
    CREATE TABLE Artwork (
        ArtworkID INT IDENTITY PRIMARY KEY,
        ArtistID INT NOT NULL,
        StyleID INT,
        Title VARCHAR(200) NOT NULL,
        YearCreated INT,
        Value DECIMAL(10,2),
        CONSTRAINT FK_Artwork_Artist FOREIGN KEY (ArtistID) REFERENCES Artist(ArtistID),
        CONSTRAINT FK_Artwork_Style FOREIGN KEY (StyleID) REFERENCES ArtStyle(StyleID)
    );

    -- Exhibition Table
    CREATE TABLE Exhibition (
        ExhibitionID INT IDENTITY PRIMARY KEY,
        MuseumID INT NOT NULL,
        CuratorID INT,
        Name VARCHAR(150) NOT NULL,
        StartDate DATE,
        EndDate DATE,
        CONSTRAINT FK_Exhibition_Museum FOREIGN KEY (MuseumID) REFERENCES Museum(MuseumID),
        CONSTRAINT FK_Exhibition_Curator FOREIGN KEY (CuratorID) REFERENCES Curator(CuratorID)
    );

    -- ArtworkExhibition Junction Table
    CREATE TABLE ArtworkExhibition (
        ArtworkID INT NOT NULL,
        ExhibitionID INT NOT NULL,
        PRIMARY KEY (ArtworkID, ExhibitionID),
        CONSTRAINT FK_AE_Artwork FOREIGN KEY (ArtworkID) REFERENCES Artwork(ArtworkID),
        CONSTRAINT FK_AE_Exhibition FOREIGN KEY (ExhibitionID) REFERENCES Exhibition(ExhibitionID)
    );
    ```

## 5. Deployment

*   **Frontend:** The React application can be deployed as a static site on a CDN or a hosting platform like **Vercel** or **Netlify** for fast global delivery.
*   **Backend:** The Node.js API can be deployed in a **Docker container** and hosted on a cloud platform such as **AWS (Elastic Beanstalk, ECS), Google Cloud (Cloud Run), or Heroku**.
*   **Database:** The SQL Server database should be hosted on a managed database service like **Azure SQL Database** or **Amazon RDS** to ensure reliability, backups, and scalability.
