from fuzzywuzzy import fuzz
import frameworkprocessor as fp
import config_handler


def search(query):
    all_title_descriptions = fp.find_all_title_description()

    results = []

    for title_description in all_title_descriptions:
        level = config_handler.get_config_processor_by_framework(title_description["framework"]).NUMBER_OF_LEVELS

        title_ratio = fuzz.token_sort_ratio(query, title_description["title"])
        # description_ratio = fuzz.token_sort_ratio(query, title_description["description"])
        bc_ratio = fuzz.token_sort_ratio(query, title_description["bc"])

        if title_ratio > 70 or bc_ratio > 70:  # currently the description can not be used in a good way
            # there needs to be a better search algorthm to use the description: semantic search?
            # for the result framework, title and bc is enough to find the respective framework entry
            results.append({
                "framework": title_description["framework"],
                "title": title_description["title"],
                "title_ratio": title_ratio,
                # "description": title_description["description"],
                # "description_ratio": description_ratio,
                "bc": title_description["bc"],
                "bc_ratio": bc_ratio,
                "level": level,
            })

    if len(results) == 0:
        results = None

    return {"results": results}
