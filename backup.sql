--
-- PostgreSQL database dump
--

\restrict wUhsomedSB6g1QppF6BnfaOqe95my0HTRFF1QTkfeegRfOd5d3BFVXplEcWFumR

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: contracttype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.contracttype AS ENUM (
    'CDI',
    'CDD',
    'STAGIAIRE',
    'EXTERNE'
);


ALTER TYPE public.contracttype OWNER TO postgres;

--
-- Name: department; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.department AS ENUM (
    'BLI',
    'CCI',
    'DTSI',
    'OBDS',
    'OBS',
    'OIT',
    'OW',
    'SAH',
    'SN3',
    'SUPPORT'
);


ALTER TYPE public.department OWNER TO postgres;

--
-- Name: equipmentcondition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.equipmentcondition AS ENUM (
    'NEW',
    'USED',
    'OUT_OF_SERVICE'
);


ALTER TYPE public.equipmentcondition OWNER TO postgres;

--
-- Name: equipmentstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.equipmentstatus AS ENUM (
    'IN_STOCK',
    'ASSIGNED'
);


ALTER TYPE public.equipmentstatus OWNER TO postgres;

--
-- Name: equipmenttype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.equipmenttype AS ENUM (
    'PC',
    'LAPTOP',
    'MONITOR',
    'PHONE',
    'ACCESSORY'
);


ALTER TYPE public.equipmenttype OWNER TO postgres;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.userrole AS ENUM (
    'ADMIN',
    'GESTIONNAIRE',
    'COLLABORATEUR'
);


ALTER TYPE public.userrole OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    cuid character varying(8),
    contract_type public.contracttype,
    department public.department
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: equipment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment (
    id integer NOT NULL,
    serial_number character varying NOT NULL,
    model character varying NOT NULL,
    equipment_type public.equipmenttype NOT NULL,
    condition public.equipmentcondition NOT NULL,
    status public.equipmentstatus NOT NULL,
    location_id integer,
    employee_id integer,
    assigned_to_user_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.equipment OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.equipment_id_seq OWNER TO postgres;

--
-- Name: equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_id_seq OWNED BY public.equipment.id;


--
-- Name: equipment_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_movements (
    id integer NOT NULL,
    equipment_id integer NOT NULL,
    employee_id integer NOT NULL,
    action character varying NOT NULL,
    from_location character varying,
    to_location character varying,
    notes text,
    "timestamp" timestamp without time zone
);


ALTER TABLE public.equipment_movements OWNER TO postgres;

--
-- Name: equipment_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.equipment_movements_id_seq OWNER TO postgres;

--
-- Name: equipment_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_movements_id_seq OWNED BY public.equipment_movements.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    site character varying NOT NULL,
    floor character varying NOT NULL,
    room character varying NOT NULL,
    exact_position character varying
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.locations_id_seq OWNER TO postgres;

--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    hashed_password character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    role public.userrole NOT NULL,
    is_active boolean
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: equipment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment ALTER COLUMN id SET DEFAULT nextval('public.equipment_id_seq'::regclass);


--
-- Name: equipment_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements ALTER COLUMN id SET DEFAULT nextval('public.equipment_movements_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name, email, cuid, contract_type, department) FROM stdin;
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (id, serial_number, model, equipment_type, condition, status, location_id, employee_id, assigned_to_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: equipment_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_movements (id, equipment_id, employee_id, action, from_location, to_location, notes, "timestamp") FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, site, floor, room, exact_position) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, hashed_password, first_name, last_name, role, is_active) FROM stdin;
1	admin@example.com	$2b$12$DXcZGgymG2QN2c3E8eInGeJZhYZ4WixIB7TrQMc2K0zbds5l4Jy8K	Admin	User	ADMIN	t
\.


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_id_seq', 1, false);


--
-- Name: equipment_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_movements_id_seq', 1, false);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locations_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: equipment_movements equipment_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_pkey PRIMARY KEY (id);


--
-- Name: equipment equipment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_employees_cuid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_employees_cuid ON public.employees USING btree (cuid);


--
-- Name: ix_employees_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_employees_email ON public.employees USING btree (email);


--
-- Name: ix_employees_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_employees_id ON public.employees USING btree (id);


--
-- Name: ix_employees_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_employees_name ON public.employees USING btree (name);


--
-- Name: ix_equipment_equipment_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_equipment_type ON public.equipment USING btree (equipment_type);


--
-- Name: ix_equipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_id ON public.equipment USING btree (id);


--
-- Name: ix_equipment_model; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_model ON public.equipment USING btree (model);


--
-- Name: ix_equipment_movements_employee_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_movements_employee_id ON public.equipment_movements USING btree (employee_id);


--
-- Name: ix_equipment_movements_equipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_movements_equipment_id ON public.equipment_movements USING btree (equipment_id);


--
-- Name: ix_equipment_movements_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_movements_id ON public.equipment_movements USING btree (id);


--
-- Name: ix_equipment_movements_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_movements_timestamp ON public.equipment_movements USING btree ("timestamp");


--
-- Name: ix_equipment_serial_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_equipment_serial_number ON public.equipment USING btree (serial_number);


--
-- Name: ix_equipment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_status ON public.equipment USING btree (status);


--
-- Name: ix_locations_floor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_locations_floor ON public.locations USING btree (floor);


--
-- Name: ix_locations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_locations_id ON public.locations USING btree (id);


--
-- Name: ix_locations_room; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_locations_room ON public.locations USING btree (room);


--
-- Name: ix_locations_site; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_locations_site ON public.locations USING btree (site);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: equipment equipment_assigned_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id);


--
-- Name: equipment equipment_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: equipment equipment_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: equipment_movements equipment_movements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(id);


--
-- Name: equipment_movements equipment_movements_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id);


--
-- PostgreSQL database dump complete
--

\unrestrict wUhsomedSB6g1QppF6BnfaOqe95my0HTRFF1QTkfeegRfOd5d3BFVXplEcWFumR

