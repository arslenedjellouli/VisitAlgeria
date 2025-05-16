
import copy
import csv
import heapq
import itertools
import json
import math
import numpy as np
import os
import pandas as pd
import random
from collections import defaultdict
from datetime import datetime, timedelta, time
import time



attraction_type_times = {
    'Natural Wonders & Landscapes': 2.0,    
    'Beaches & Islands': 3.0,                
    'Wildlife & Nature Reserves': 3.0,      
    'Historical & Architectural Sites': 2.0, 
    'Parks & Recreation Areas': 2.0, 
    'Shopping & Souks': 3.0,
    'Museums & Cultural Centers': 2.5,
    'Cultural & Heritage Sites': 2.0,
    'Oases & Springs': 3.0,
    'Urban Attractions & Entertainment': 2.0
}



AVERAGE_SPEED = 45  # kmh (Average speed)
DAYS = 7
START_TIME = datetime.strptime("08:30", '%H:%M')
MAX_WILAYAS = 7
RESTAURANT_STAY = 1.0
HOTEL_RETURN_TIME = datetime.strptime("20:00", '%H:%M')
COST_PER_KM = 10



class Location:
    def __init__(self, id, name, loc_type, wilaya, lat, long, category=None, cost=0, rating=0,
                 description="", closing_days=None, opening_hours=None, closing_hours=None,phone_number=None,website=None,img_url=None):
        self.id = id
        self.name = name
        self.loc_type = loc_type
        self.wilaya = wilaya
        self.lat = float(lat) if lat else 0.0
        self.long = float(long) if long else 0.0
        self.category = category
        self.cost = float(cost) if cost else 0.0
        self.rating = float(rating) if rating else 0.0
        self.description = description
        self.closing_days = closing_days
        self.opening_hours = opening_hours
        self.closing_hours = closing_hours
        self.phone_number = phone_number
        self.website = website
        self.img_url = img_url

    def __str__(self):
        return f"{self.name} ({self.wilaya}) - {self.loc_type}"

class Wilaya:
    def __init__(self, name, coords, density, attractions, hotels, restaurants):
        self.name = name
        self.coords = coords
        self.density = density
        self.attractions_categories = attractions['categories']
        self.attractions_avg_cost = attractions['avg_cost_by_category']
        self.avg_attraction_cost = attractions['avg_cost']
        self.hotels_ratings = hotels['rating']
        self.num_hotels = hotels['number']
        self.avg_hotel_cost = hotels['avg_cost']
        self.avg_restaurant_cost = restaurants['avg_cost']
        self.avg_restaurant_rating = restaurants['avg_rating']
        self.num_restaurants = restaurants['number']

    def __str__(self):
        return self.name

class UserPreferences:
    def __init__(self, currentLat, currentLong, interests, budgetPerDay,
                 minHotelRat=0, maxHotelRat=5, visitedAttractions=None, currentWilaya=""):
        self.currentLat = currentLat
        self.currentLong = currentLong
        self.interests = interests
        self.budgetPerDay = budgetPerDay
        self.minHotelRate = minHotelRat
        self.maxHotelRate = maxHotelRat
        self.visitedAttractions = visitedAttractions if visitedAttractions else {}
        self.currentWilaya = currentWilaya

    def __str__(self):
        return (
            f"[Location: ({self.currentLat}, {self.currentLong}) | "
            f"Interests: {', '.join(self.interests)} | "
            f"Budget/Day: {self.budgetPerDay} DZD | "
            f"Hotel Rating: {self.minHotelRate}-{self.maxHotelRate} | "
            f"Visited: {self.visitedAttractions if self.visitedAttractions else 'None'}]"
        )

class TravelPlanner:
    def __init__(self, locations_file, wilayas_file):
        self.locations = self.load_locations(locations_file)
        self.wilayas = self.load_wilayas(wilayas_file)
        self.wilaya_locations = self.organize_locations_by_wilaya()

    def load_locations(self, filename):
        locations = []
        with open(filename, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                loc = Location(
                    row['id'], row['name'], row['loc_type'], row['wilaya'],
                    row['latitude'], row['longitude'], row.get('category'),
                    row.get('cost'), row.get('rating'), row.get('description'),
                    row.get('closing_days'), row.get('opening_hours'), row.get('closing_hours'),row.get('phone_number'),row.get('website'),row.get('img_url')
                )
                locations.append(loc)
        return locations

    def load_wilayas(self, filename):
        with open(filename, 'r', encoding='utf-8') as file:
            data = json.load(file)
            return {w['wilaya']: Wilaya(w['wilaya'], w['coords'], w['density'],
                                      w['attractions'], w['hotels'], w['restaurants'])
                    for w in data}

    def organize_locations_by_wilaya(self):
        wilaya_locations = defaultdict(lambda: defaultdict(list))
        for loc in self.locations:
            wilaya_locations[loc.wilaya][loc.loc_type].append(loc)
        return wilaya_locations

    def haversine_distance(self, lat1, lon1, lat2, lon2):
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        r = 6371
        return c * r

    def calculate_travel_time(self, distance):
        return distance / AVERAGE_SPEED  # in hours

    def filter_by_preferences(self, items, user_prefs, loc_type):
        filtered = []
        for item in items:
            if loc_type == 'attraction' and item.id in user_prefs.visitedAttractions:
                continue
            if loc_type == 'hotel' and (item.rating < user_prefs.minHotelRate or
                                        item.rating > user_prefs.maxHotelRate):
                continue
            filtered.append(item)
        return filtered

    def calculate_wilaya_score(self, wilaya_name, user_prefs, debug=False):
        wilaya = self.wilayas.get(wilaya_name)
        if not wilaya:
            return -math.inf

        score = 0.0
        matched_categories = 0
        has_matching_attraction = False

        for interest in user_prefs.interests:
            count = wilaya.attractions_categories.get(interest, 0)
            if count > 0:
                matched_categories += 1
                has_matching_attraction = True
                score += count * 10
                
        if matched_categories > 0:
            category_bonus = 20 * (2 ** matched_categories)
            score += category_bonus

        if not has_matching_attraction:
            return -1e9

        found_suitable_hotel = False
        hotel_score = 0

        for star_str, count in wilaya.hotels_ratings.items():
            try:
                stars = float(star_str)
                if user_prefs.minHotelRate <= stars <= user_prefs.maxHotelRate:
                    hotel_score += count * stars
                    found_suitable_hotel = True
            except ValueError:
                continue

        if not found_suitable_hotel:
            score -= 1e5
        else:
            score += hotel_score * 5

        restaurant_score = wilaya.num_restaurants * wilaya.avg_restaurant_rating
        score += restaurant_score

        distance = self.haversine_distance(
            user_prefs.currentLat, user_prefs.currentLong,
            wilaya.coords[0], wilaya.coords[1]
        )
        distance_penalty = distance * 0.5
        score -= distance_penalty

        avg_daily_cost = wilaya.avg_attraction_cost + wilaya.avg_hotel_cost + wilaya.avg_restaurant_cost
        if avg_daily_cost > user_prefs.budgetPerDay * 1.2:
            score -= 1e6
        elif avg_daily_cost > user_prefs.budgetPerDay:
            score -= (avg_daily_cost - user_prefs.budgetPerDay) * 10

        return score

    def generate_daily_plan(self, wilaya_name, day_num, user_prefs, prev_hotel=None):
        best_plan = None
        best_score = -1

        for attempt in range(100):
            day_plan = {
                'wilaya': wilaya_name,
                'hotel': None,
                'attractions_morning': [],
                'restaurant': None,
                'attractions_afternoon': [],
                'hotel_night': None,
                'total_cost': 0,
                'total_travel_time': 0,
                'schedule': [],
                'distances': []
            }

            wilaya_locs = self.wilaya_locations[wilaya_name]

            if prev_hotel and prev_hotel.wilaya == wilaya_name:
                hotel = prev_hotel
            else:
                hotels = self.filter_by_preferences(wilaya_locs['hotel'], user_prefs, 'hotel')
                if not hotels:
                    continue
                hotel = random.choice(hotels)

            day_plan['hotel'] = hotel
            day_plan['hotel_night'] = hotel

            current_time = START_TIME
            current_location = hotel
            day_plan['schedule'].append({
                'time': current_time.strftime('%H:%M'),
                'location': hotel,
                'activity': 'Depart from hotel',
                'travel_time': 0,
                'distance': 0,
                'cost': 0,
                'stay_duration': 0,

                'wilaya': hotel.wilaya,
                'loc_type': hotel.loc_type,
                'latitude': hotel.lat,
                'longitude': hotel.long,
                'category': hotel.category,
                'rating' : hotel.rating,
                'description': hotel.description,
                'phone_number': hotel.phone_number,
                'img_url': hotel.img_url,
                'website': hotel.website,
                'description' : None,
                'closing_days': None,
                'opening_hours': None,
                'closing_hours': None
            })

            attractions = self.filter_by_preferences(wilaya_locs['attraction'], user_prefs, 'attraction')
            attractions = [a for a in attractions if a.category in attraction_type_times]

            if not attractions:
                continue

            def attraction_score(attraction):
                score = 0
                if attraction.category in user_prefs.interests:
                    score += 50
                distance = self.haversine_distance(
                    current_location.lat, current_location.long,
                    attraction.lat, attraction.long
                )
                return score - distance

            attractions.sort(key=attraction_score, reverse=True)
            morning_attractions = attractions[:min(2, len(attractions))]

            for attraction in morning_attractions:
                distance = self.haversine_distance(
                    current_location.lat, current_location.long,
                    attraction.lat, attraction.long
                )
                travel_time = self.calculate_travel_time(distance)
                stay_duration = attraction_type_times.get(attraction.category, 2.0)

                current_time += timedelta(hours=travel_time)
                arrival_time = current_time

                day_plan['schedule'].append({
                    'time': arrival_time.strftime('%H:%M'),
                    'location': attraction,
                    'activity': f'Visit {attraction.name}',
                    'travel_time': travel_time * 60,
                    'distance': distance,
                    'cost': attraction.cost,
                    'stay_duration': stay_duration * 60,

                    'wilaya' : attraction.wilaya,
                    'loc_type': attraction.loc_type,
                    'latitude': attraction.lat,
                    'longitude': attraction.long,
                    'category': attraction.category,
                    'rating' : attraction.rating,
                    'description': attraction.description,
                    'closing_days': attraction.closing_days,
                    'opening_hours': attraction.opening_hours,
                    'closing_hours': attraction.closing_hours,
                    'phone_number': attraction.phone_number,
                    'img_url': attraction.img_url,
                    'website': attraction.website
                })

                current_time += timedelta(hours=stay_duration)
                current_location = attraction
                day_plan['attractions_morning'].append(attraction)
                day_plan['distances'].append(distance)

            time_to_hotel = self.calculate_travel_time(
                self.haversine_distance(
                    current_location.lat, current_location.long,
                    hotel.lat, hotel.long
                )
            )
            potential_return_time = current_time + timedelta(hours=time_to_hotel)

            if potential_return_time.time() > HOTEL_RETURN_TIME.time():
                distance = self.haversine_distance(
                    current_location.lat, current_location.long,
                    hotel.lat, hotel.long
                )
                travel_time = self.calculate_travel_time(distance)

                current_time += timedelta(hours=travel_time)
                arrival_time = current_time

                day_plan['schedule'].append({
                    'time': arrival_time.strftime('%H:%M'),
                    'location': hotel,
                    'activity': 'Return to hotel',
                    'travel_time': travel_time * 60,
                    'distance': distance,
                    'cost': 0,
                    'stay_duration': 0,

                    'wilaya': hotel.wilaya,
                    'loc_type': hotel.loc_type,
                    'latitude': hotel.lat,
                    'longitude': hotel.long,
                    'category': hotel.category,
                    'rating' : hotel.rating,
                    'description': hotel.description,
                    'phone_number': hotel.phone_number,
                    'img_url': hotel.img_url,
                    'website': hotel.website,
                    'closing_days': None,
                    'opening_hours': None,
                    'closing_hours': None,
                    'website' : None
                })

                day_plan['distances'].append(distance)
            else:
                restaurants = self.filter_by_preferences(wilaya_locs['restaurant'], user_prefs, 'restaurant')
                if restaurants:
                    potential_restaurants = []
                    for restaurant in restaurants:
                        temp_distances = day_plan['distances'].copy()
                        distance = self.haversine_distance(
                            current_location.lat, current_location.long,
                            restaurant.lat, restaurant.long
                        )
                        temp_distances.append(distance)

                        temp_cost = self.calculate_daily_cost(
                            hotel,
                            day_plan['attractions_morning'],
                            restaurant,
                            temp_distances
                        )

                        travel_time = self.calculate_travel_time(distance)
                        restaurant_end_time = current_time + timedelta(hours=travel_time + RESTAURANT_STAY)

                        time_to_hotel_from_restaurant = self.calculate_travel_time(
                            self.haversine_distance(
                                restaurant.lat, restaurant.long,
                                hotel.lat, hotel.long
                            )
                        )
                        potential_return_time = restaurant_end_time + timedelta(hours=time_to_hotel_from_restaurant)

                        if potential_return_time.time() <= HOTEL_RETURN_TIME.time() and temp_cost <= user_prefs.budgetPerDay:
                            potential_restaurants.append((distance, restaurant))

                    if potential_restaurants:
                        potential_restaurants.sort(key=lambda x: x[0])
                        restaurant = potential_restaurants[0][1]
                        distance = potential_restaurants[0][0]
                        travel_time = self.calculate_travel_time(distance)

                        current_time += timedelta(hours=travel_time)
                        arrival_time = current_time

                        day_plan['schedule'].append({
                            'time': arrival_time.strftime('%H:%M'),
                            'location': restaurant,
                            'activity': 'Lunch',
                            'travel_time': travel_time * 60,
                            'distance': distance,
                            'cost': restaurant.cost,
                            'stay_duration': RESTAURANT_STAY * 60,

                            'wilaya' : restaurant.wilaya,
                            'loc_type': restaurant.loc_type,
                            'latitude': restaurant.lat,
                            'longitude': restaurant.long,
                            'category': restaurant.category,
                            'rating' : restaurant.rating,
                            'closing_days': restaurant.closing_days,
                            'opening_hours': restaurant.opening_hours,
                            'closing_hours': restaurant.closing_hours,
                            'phone_number': restaurant.phone_number,
                            'img_url': restaurant.img_url,
                            'email' : None,
                            'description' : None,
                            'website' : None
                
                        })

                        current_time += timedelta(hours=RESTAURANT_STAY)
                        current_location = restaurant
                        day_plan['restaurant'] = restaurant
                        day_plan['distances'].append(distance)

                        time_to_hotel = self.calculate_travel_time(
                            self.haversine_distance(
                                current_location.lat, current_location.long,
                                hotel.lat, hotel.long
                            )
                        )
                        potential_return_time = current_time + timedelta(hours=time_to_hotel)

                        if potential_return_time.time() <= HOTEL_RETURN_TIME.time():
                            remaining_attractions = [a for a in attractions if a not in morning_attractions]
                            if remaining_attractions:
                                remaining_attractions.sort(key=attraction_score, reverse=True)

                                for attraction in remaining_attractions[:2]:
                                    distance = self.haversine_distance(
                                        current_location.lat, current_location.long,
                                        attraction.lat, attraction.long
                                    )
                                    travel_time = self.calculate_travel_time(distance)
                                    stay_duration = attraction_type_times.get(attraction.category, 2.0)

                                    potential_end_time = current_time + timedelta(hours=travel_time + stay_duration)
                                    time_to_hotel_after_attraction = self.calculate_travel_time(
                                        self.haversine_distance(
                                            attraction.lat, attraction.long,
                                            hotel.lat, hotel.long
                                        )
                                    )
                                    final_return_time = potential_end_time + timedelta(hours=time_to_hotel_after_attraction)

                                    if final_return_time.time() > HOTEL_RETURN_TIME.time():
                                        continue

                                    temp_distances = day_plan['distances'].copy()
                                    temp_distances.append(distance)
                                    temp_distances.append(self.haversine_distance(
                                        attraction.lat, attraction.long,
                                        hotel.lat, hotel.long
                                    ))

                                    temp_cost = self.calculate_daily_cost(
                                        hotel,
                                        day_plan['attractions_morning'] + [attraction],
                                        restaurant,
                                        temp_distances
                                    )

                                    if temp_cost > user_prefs.budgetPerDay:
                                        continue

                                    current_time += timedelta(hours=travel_time)
                                    arrival_time = current_time

                                    day_plan['schedule'].append({
                                        'time': arrival_time.strftime('%H:%M'),
                                        'location': attraction,
                                        'activity': f'Visit {attraction.name}',
                                        'travel_time': travel_time * 60,
                                        'distance': distance,
                                        'cost': attraction.cost,
                                        'stay_duration': stay_duration * 60,
                                        'wilaya' : attraction.wilaya,
                                        'loc_type': attraction.loc_type,
                                        'latitude': attraction.lat,
                                        'longitude': attraction.long,
                                        'category': attraction.category,
                                        'rating' : attraction.rating,
                                        'description': attraction.description,
                                        'closing_days': attraction.closing_days,
                                        'opening_hours': attraction.opening_hours,
                                        'closing_hours': attraction.closing_hours,
                                        'phone_number': attraction.phone_number,
                                        'img_url': attraction.img_url,
                                        'website': attraction.website,
                                        
                                    })

                                    current_time += timedelta(hours=stay_duration)
                                    current_location = attraction
                                    day_plan['attractions_afternoon'].append(attraction)
                                    day_plan['distances'].append(distance)

                                    time_to_hotel = self.calculate_travel_time(
                                        self.haversine_distance(
                                            current_location.lat, current_location.long,
                                            hotel.lat, hotel.long
                                        )
                                    )
                                    potential_return_time = current_time + timedelta(hours=time_to_hotel)

                                    if potential_return_time.time() > HOTEL_RETURN_TIME.time():
                                        break

                distance = self.haversine_distance(
                    current_location.lat, current_location.long,
                    hotel.lat, hotel.long
                )
                travel_time = self.calculate_travel_time(distance)

                current_time += timedelta(hours=travel_time)
                arrival_time = current_time

                day_plan['schedule'].append({
                    'time': arrival_time.strftime('%H:%M'),
                    'location': hotel,
                    'activity': 'Return to hotel',
                    'travel_time': travel_time * 60,
                    'distance': distance,
                    'cost': 0,
                    'stay_duration': 0,

                    'wilaya': hotel.wilaya,
                    'loc_type': hotel.loc_type,
                    'latitude': hotel.lat,
                    'longitude': hotel.long,
                    'category': hotel.category,
                    'rating' : hotel.rating,
                    'description': hotel.description,
                    'phone_number': hotel.phone_number,
                    'img_url': hotel.img_url,
                    'website': hotel.website,
                    'closing_days': None,
                    'opening_hours': None,
                    'closing_hours': None
                })

                day_plan['distances'].append(distance)

            total_travel_time = sum(
                self.calculate_travel_time(d) for d in day_plan['distances']
            )
            day_plan['total_travel_time'] = total_travel_time

            day_plan['total_cost'] = self.calculate_daily_cost(
                hotel,
                day_plan['attractions_morning'] + day_plan['attractions_afternoon'],
                day_plan['restaurant'],
                day_plan['distances']
            )

            if day_plan['total_cost'] <= user_prefs.budgetPerDay:
                score = (
                    len(day_plan['attractions_morning'] + day_plan['attractions_afternoon']) * 100 +
                    (user_prefs.budgetPerDay - day_plan['total_cost']) +
                    sum(1 for a in day_plan['attractions_morning'] + day_plan['attractions_afternoon']
                      if a.category in user_prefs.interests) * 50
                )

                if score > best_score:
                    best_score = score
                    best_plan = day_plan

        return best_plan

    def generate_itinerary(self, user_prefs, debug=False):
        k = random.choices([2, 3, 4, 5], weights=[2, 3, 3, 2], k=1)[0]
        selected_wilayas = self.select_wilayas(user_prefs, k)

        days_per_wilaya = [DAYS // k] * k
        for i in range(DAYS % k):
            days_per_wilaya[i] += 1

        itinerary = []
        prev_hotel = None
        day_num = 1

        current_prefs = UserPreferences(
            user_prefs.currentLat,
            user_prefs.currentLong,
            user_prefs.interests,
            user_prefs.budgetPerDay,
            user_prefs.minHotelRate,
            user_prefs.maxHotelRate,
            user_prefs.visitedAttractions.copy(),
            user_prefs.currentWilaya
        )

        for wilaya, days in zip(selected_wilayas, days_per_wilaya):
            for _ in range(days):
                day_plan = self.generate_daily_plan(wilaya, day_num, current_prefs, prev_hotel)
                if not day_plan:
                    return None

                for attraction in day_plan['attractions_morning'] + day_plan['attractions_afternoon']:
                    current_prefs.visitedAttractions[attraction.id] = True

                itinerary.append(day_plan)
                prev_hotel = day_plan['hotel_night']
                day_num += 1

        return itinerary

    def generate_itinerary_json(self, user_prefs, debug=False):
        itinerary = self.generate_itinerary(user_prefs, debug)
        if not itinerary:
            return {"error": "No valid itinerary found within constraints"}

        os.makedirs("itineraries", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"itineraries/itinerary_{timestamp}.json"

        json_output = {"itinerary": [], "summary": {}}

        total_distance = 0.0
        total_cost = 0
        total_travel_hours = 0.0
        attractions_visited = []
        wilaya_days = defaultdict(int)
        visited_attractions = user_prefs.visitedAttractions.copy()

        for day_plan in itinerary:
            day_data = {
                "day": len(json_output["itinerary"]) + 1,
                "wilaya": day_plan["wilaya"],
                "total_distance": round(sum(day_plan["distances"]), 1),
                "total_cost": round(day_plan["total_cost"], 2),
                "total_travel_time": self.format_duration(day_plan["total_travel_time"]),
                "schedule": []
            }

            for event in day_plan["schedule"]:
                event_data = {
                    "time": event["time"],
                    "location": event["location"].name,
                    "type": event["location"].loc_type,
                    "activity": event["activity"],
                    "travel_time": self.format_duration(event["travel_time"] / 60),
                    "distance": round(event["distance"], 1),
                    "cost": event["cost"],
                    "stay_duration": self.format_duration(event["stay_duration"] / 60),

                    'wilaya' : event["wilaya"],
                    'loc_type': event["loc_type"],
                    'latitude': event["latitude"],
                    'longitude': event["longitude"],
                    'category': event["category"],
                    'rating' : event["rating"],
                    'description': event["description"],
                    'closing_days': event["closing_days"],
                    'opening_hours': event["opening_hours"],
                    'closing_hours': event["closing_hours"],
                    'phone_number': event["phone_number"],
                    'img_url': event["img_url"],
                    'website': event["website"]
                }
                day_data["schedule"].append(event_data)

                if event["location"].loc_type == "attraction":
                    attractions_visited.append(event["location"].category)
                    visited_attractions[event["location"].id] = True

            total_distance += day_data["total_distance"]
            total_cost += day_data["total_cost"]
            total_travel_hours += day_plan["total_travel_time"]
            wilaya_days[day_plan["wilaya"]] += 1

            json_output["itinerary"].append(day_data)

        json_output["summary"] = {
            "total_distance": round(total_distance, 1),
            "total_cost": round(total_cost, 2),
            "total_travel_time": self.format_duration(total_travel_hours),
            "total_attractions_visited": len(attractions_visited),
            "average_cost_per_day": round(total_cost / len(itinerary), 2),
            "most_visited_wilaya": max(wilaya_days.items(), key=lambda x: x[1])[0],
            "preferred_attraction_type": max(set(attractions_visited), key=attractions_visited.count, default="None"),
            "visited_attractions": visited_attractions
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(json_output, f, indent=2, ensure_ascii=False)
        
        return filename

    def select_wilayas(self, user_prefs, k, debug=False):
        scored_wilayas = []
        for wilaya_name in self.wilayas:
            if wilaya_name == user_prefs.currentWilaya:
                continue

            score = self.calculate_wilaya_score(wilaya_name, user_prefs, debug)
            if score > -1e8:
                scored_wilayas.append((score, wilaya_name))

        scored_wilayas.sort(reverse=True, key=lambda x: x[0])
        selected = [name for score, name in scored_wilayas[:k]]
        return selected

    def calculate_daily_cost(self, hotel, attractions, restaurant, distances):
        transport_cost = sum(d * COST_PER_KM for d in distances)
        attraction_cost = sum(a.cost for a in attractions)
        restaurant_cost = restaurant.cost if restaurant else 0
        hotel_cost = hotel.cost if hotel else 0
        return transport_cost + attraction_cost + restaurant_cost + hotel_cost

    def format_duration(self, hours):
        total_minutes = int(hours * 60)
        h = total_minutes // 60
        m = total_minutes % 60
        return f"{h}h{m:02d}" if m > 0 else f"{h}h"

    def print_itinerary(self, itinerary):
        if not itinerary:
            print("Could not generate a valid itinerary with the given constraints.")
            return

        for i, day in enumerate(itinerary, 1):
            print(f"\nDay {i}: {day['wilaya']} {{")

            daily_transport_cost = 0
            daily_attraction_cost = sum(a.cost for a in day['attractions_morning'] + day['attractions_afternoon'])
            daily_restaurant_cost = day['restaurant'].cost if day['restaurant'] else 0
            daily_hotel_cost = day['hotel_night'].cost if day['hotel_night'] else 0

            for j, event in enumerate(day['schedule']):
                transport_cost = 0
                if j > 0 and event['location'].loc_type != 'hotel':
                    prev_event = day['schedule'][j-1]
                    transport_cost = event['distance'] * COST_PER_KM
                    daily_transport_cost += transport_cost

                travel_time_str = self.format_duration(event['travel_time'] / 60) if event['travel_time'] > 0 else "0h"

                print(f"{event['time']} : {event['location'].name} ({event['location'].loc_type}) | "
                      f"Activity: {event['activity']} | "
                      f"Travel time: {travel_time_str} | "
                      f"Distance: {event['distance']:.1f} km | "
                      f"Transport cost: {transport_cost:.0f} DZD | "
                      f"Entry cost: {event['cost']:.0f} DZD | "
                      f"Stay: {self.format_duration(event['stay_duration'] / 60)}")

            print(f"}}")

            total_daily_cost = (daily_transport_cost + daily_attraction_cost +
                               daily_restaurant_cost + daily_hotel_cost)

            print(f"\nSummary for Day {i}:")
            print(f"- Transport: {daily_transport_cost:.0f} DZD")
            print(f"- Attractions: {daily_attraction_cost:.0f} DZD")
            print(f"- Restaurant: {daily_restaurant_cost:.0f} DZD")
            print(f"- Hotel: {daily_hotel_cost:.0f} DZD")
            print(f"Total cost for day {i}: {total_daily_cost:.0f} DZD")
            print(f"Total travel time: {self.format_duration(day['total_travel_time'])}")