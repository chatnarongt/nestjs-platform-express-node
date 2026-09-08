IF DB_ID('benchmark') IS NULL
    CREATE DATABASE benchmark;
GO
USE benchmark;
GO
IF OBJECT_ID('world') IS NULL
BEGIN
    CREATE TABLE world (
        id INT IDENTITY(1,1) PRIMARY KEY,
        random_number INT NOT NULL
    );

    INSERT INTO world (random_number)
    SELECT TOP 100000 ABS(CHECKSUM(NEWID())) % 1000001
    FROM sys.all_objects a
    CROSS JOIN sys.all_objects b;
END
GO
