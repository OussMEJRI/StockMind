--
-- PostgreSQL database dump
--

\restrict B7uxbXELbgXQptm0vP0L6XcRAHXe9b1Z71nBaKLOk1lfcZV33MYQuliGaMhA4Ht

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
-- Name: emplacements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emplacements (
    id integer NOT NULL,
    site character varying(100) NOT NULL,
    etage character varying(50) NOT NULL,
    rosace character varying(50) NOT NULL,
    exact_position character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emplacements OWNER TO postgres;

--
-- Name: emplacement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.emplacement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.emplacement_id_seq OWNER TO postgres;

--
-- Name: emplacement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.emplacement_id_seq OWNED BY public.emplacements.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    cuid character varying(50) NOT NULL,
    contract_type character varying(50),
    department character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
    serial_number character varying(100) NOT NULL,
    model character varying(255) NOT NULL,
    equipment_type character varying(50) NOT NULL,
    condition character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    employee_id integer,
    emplacement_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
    from_employee_id integer,
    to_employee_id integer,
    from_location_id integer,
    to_location_id integer,
    movement_type character varying(50) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
-- Name: emplacements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emplacements ALTER COLUMN id SET DEFAULT nextval('public.emplacement_id_seq'::regclass);


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
-- Data for Name: emplacements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.emplacements (id, site, etage, rosace, exact_position, created_at, updated_at) FROM stdin;
1	Site A	1er étage	Salle 101	\N	2026-04-15 00:50:24.466882+00	2026-04-15 00:50:24.466882+00
2	Sterling	2CENTRALE	11	Sterling - 2CENTRALE - Rosace 11	2026-04-15 01:04:38.493221+00	2026-04-15 01:04:38.493221+00
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name, email, cuid, contract_type, department, created_at, updated_at) FROM stdin;
1	Test tess2	test1@gmail.com	AFRE6654	CDI	SUPPORT	2026-04-15 00:43:48.438607+00	2026-04-15 00:43:48.438607+00
2	Jean Dupont	jean.dupont@example.com	CMCX1234	CDI	SUPPORT	2026-04-15 00:43:48.44306+00	2026-04-15 00:43:48.44306+00
3	Test tess3	test2@gmail.com	DUUG8876	CDI	OIT	2026-04-15 00:43:48.454976+00	2026-04-15 00:43:48.454976+00
4	Test tess4	test3@gmail.com	YZEY6654	CDI	OIT	2026-04-15 00:43:48.528445+00	2026-04-15 00:43:48.528445+00
\.


--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment (id, serial_number, model, equipment_type, condition, status, employee_id, emplacement_id, created_at, updated_at) FROM stdin;
1	AZERTY765RE	DELL 5420	laptop	new	assigned	2	\N	2026-04-15 00:43:25.5187+00	2026-04-15 01:05:09.79588+00
\.


--
-- Data for Name: equipment_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_movements (id, equipment_id, from_employee_id, to_employee_id, from_location_id, to_location_id, movement_type, notes, created_at) FROM stdin;
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
1	admin@example.com	$2b$12$qZRGu9LZ3740nJ7ny2mAB.q0vmbf41ps7eG5iaUPZ1ziTpSzQ17By	Admin	User	ADMIN	t
\.


--
-- Name: emplacement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.emplacement_id_seq', 2, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 4, true);


--
-- Name: equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_id_seq', 1, true);


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
-- Name: emplacements emplacement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emplacements
    ADD CONSTRAINT emplacement_pkey PRIMARY KEY (id);


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
-- Name: ix_emplacement_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_emplacement_id ON public.emplacements USING btree (id);


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
-- Name: ix_equipment_movements_equipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_movements_equipment_id ON public.equipment_movements USING btree (equipment_id);


--
-- Name: ix_equipment_movements_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipment_movements_id ON public.equipment_movements USING btree (id);


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
-- Name: equipment equipment_emplacement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_emplacement_id_fkey FOREIGN KEY (emplacement_id) REFERENCES public.emplacements(id) ON DELETE SET NULL;


--
-- Name: equipment equipment_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: equipment_movements equipment_movements_equipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;


--
-- Name: equipment_movements equipment_movements_from_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_from_employee_id_fkey FOREIGN KEY (from_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: equipment_movements equipment_movements_from_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES public.emplacements(id) ON DELETE SET NULL;


--
-- Name: equipment_movements equipment_movements_to_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_to_employee_id_fkey FOREIGN KEY (to_employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: equipment_movements equipment_movements_to_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_movements
    ADD CONSTRAINT equipment_movements_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES public.emplacements(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict B7uxbXELbgXQptm0vP0L6XcRAHXe9b1Z71nBaKLOk1lfcZV33MYQuliGaMhA4Ht

